import { Box, Button, Heading, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import type {
  SupabaseClient,
  SupabaseRealtimePayload,
} from "@supabase/supabase-js";
import { useEffect } from "react";
import { supabase, useSupabaseClient } from "~/db";
import {
  getOrganizationBySlug,
  getProfilesByTeamSlug,
  getTaskById,
} from "~/models";
import { getSession } from "~/sessions";
import type { Estimation, Profile, Task, UserSession } from "~/_types";

interface LoaderData {
  data: {
    estimations: Array<
      Estimation & {
        profiles: Array<Profile>;
      }
    >;
    teamMembersProfiles: Array<Profile>;
    task: Task;
  };
}

export const action: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData();
  const effort = Number(formData.get("effort") as string);
  const session = await getSession(request.headers.get("Cookie"));

  const { accessToken, user: userCookie } =
    (session.get("authenticated") as UserSession) || {};

  const { user } = await supabase.auth.api.getUser(accessToken);

  if (!user || !userCookie) {
    return redirect("/signin");
  }

  await supabase.from<Estimation>("estimations").upsert({
    effort,
    justification: "Some justification",
    taskId: Number(params?.taskId! as string),
    userId: user.id,
  });

  const {
    data: {
      0: { id: organizationId },
    },
  } = await getOrganizationBySlug(params.orgSlug!);

  const { data: teamMembersProfiles } = await getProfilesByTeamSlug({
    organizationId,
    slug: params.teamSlug!,
  });

  if (!teamMembersProfiles) throw new Error("No team members");

  const teamMembersIds = teamMembersProfiles.map((p) => p.id);

  const { data: estimations } = await supabase
    .from<
      Estimation & {
        profiles: Array<Profile>;
      }
    >("estimations")
    .select("*, profiles (*)")
    .in("userId", teamMembersIds)
    .eq("taskId", params?.taskId!);

  if (estimations?.length === teamMembersIds.length) {
    const efforts = estimations
      .filter((e) => e.effort && e.effort > 0)
      .map((e: Estimation) => e.effort) as Array<NonNullable<Task["effort"]>>;

    const effortsAvg = efforts.reduce((a, b) => a + b, 0) / efforts.length;

    await supabase
      .from<Task>("tasks")
      .update({
        effort: effortsAvg,
      })
      .eq("id", Number(params?.taskId! as string));
  }

  return json({});
};

export const loader: LoaderFunction = async ({ params }) => {
  const {
    data: { 0: task },
  } = await getTaskById(params.taskId!);

  const {
    data: {
      0: { id: organizationId },
    },
  } = await getOrganizationBySlug(params.orgSlug!);

  const { data: teamMembersProfiles } = await getProfilesByTeamSlug({
    organizationId,
    slug: params.teamSlug!,
  });

  if (!teamMembersProfiles) throw new Error("No team members");

  const teamMembersIds = teamMembersProfiles.map((p) => p.id);

  const { data: estimations } = await supabase
    .from<
      Estimation & {
        profiles: Array<Profile>;
      }
    >("estimations")
    .select("*, profiles (*)")
    .in("userId", teamMembersIds)
    .eq("taskId", params?.taskId!);

  if (!estimations) throw new Error("No estimations");

  return json<LoaderData>({
    data: {
      estimations,
      teamMembersProfiles,
      task,
    },
  });
};

const getEstimationsTableSubscription = ({
  callback,
  client,
}: {
  client: SupabaseClient;
  callback: (payload: SupabaseRealtimePayload<unknown>) => void;
}) => {
  return client.from("estimations").on("*", callback).subscribe();
};

const EstimateTaskRoute = () => {
  const {
    data: { estimations, teamMembersProfiles, task },
  } = useLoaderData<LoaderData>();

  const fetcher = useFetcher();

  const { user } = useSupabaseClient();

  useEffect(() => {
    if (!supabase) return;

    const subscription = getEstimationsTableSubscription({
      callback: () => {
        fetcher.submit(null, { method: "post" });
      },
      client: supabase,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetcher]);

  const { product } = useParams();

  return (
    <Stack>
      <Heading>{`Estimating task: "${task.name}"`}</Heading>
      {task.effort ? (
        <Heading
          color={`${product}.400`}
          size="md"
        >{`Hooray! This task's effort is ${Number(task.effort)}`}</Heading>
      ) : null}
      <Box>
        {teamMembersProfiles.map((profile: Profile) => {
          if (user?.id === profile.id) {
            // Current user

            const currentUserEstimation: Estimation =
              estimations.filter((e: Estimation) => {
                return e.userId === user?.id!;
              })?.[0] ?? null;

            const userVoted = !!currentUserEstimation;

            return (
              <Box key={profile.id}>
                <Wrap p={1}>
                  {profile.firstName} {profile.lastName} (You)
                </Wrap>
                <Wrap p={1} as={fetcher.Form} method="post">
                  {[1, 2, 3, 5, 8, 13].map((effortOption) => {
                    return (
                      <WrapItem
                        key={effortOption}
                        as={Button}
                        type={"submit"}
                        value={effortOption}
                        name="effort"
                        p={3}
                        border={
                          userVoted
                            ? currentUserEstimation.effort === effortOption
                              ? "1px solid red"
                              : "none"
                            : "none"
                        }
                      >
                        {effortOption}
                      </WrapItem>
                    );
                  })}
                </Wrap>
              </Box>
            );
          }

          const teammateVote =
            estimations.filter(
              ({ userId }: Estimation) => userId === profile.id
            )[0] ?? null;

          // Isn't current user
          return (
            <>
              <Wrap>
                {profile.firstName} {profile.lastName}
              </Wrap>
              <Wrap key={profile.id} p={1} as={fetcher.Form} method="post">
                {[1, 2, 3, 5, 8, 13].map((effortOption) => {
                  return (
                    <WrapItem
                      key={effortOption}
                      as={Button}
                      type={"button"}
                      name="effort"
                      p={3}
                      border={
                        teammateVote
                          ? effortOption === teammateVote.effort
                            ? "1px solid red"
                            : "none"
                          : "none"
                      }
                    >
                      {effortOption}
                    </WrapItem>
                  );
                })}
              </Wrap>
            </>
          );
        })}
      </Box>
    </Stack>
  );
};

export default EstimateTaskRoute;
