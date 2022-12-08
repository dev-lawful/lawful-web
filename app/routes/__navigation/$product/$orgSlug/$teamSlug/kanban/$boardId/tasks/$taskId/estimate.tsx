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
  getEstimationsByTaskId,
  getOrganizationBySlug,
  getProfilesByTeamSlug,
  getTaskById,
  updateTaskEffort,
  upsertEstimationByUserId,
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
  switch (request.method) {
    case "POST": {
      const formData = await request.formData();
      const effort = Number(formData.get("effort") as string);
      const session = await getSession(request.headers.get("Cookie"));

      const { accessToken, user: userCookie } =
        (session.get("authenticated") as UserSession) || {};

      const { user } = await supabase.auth.api.getUser(accessToken);

      if (!user || !userCookie) {
        return redirect("/signin");
      }

      await upsertEstimationByUserId({
        userId: params?.userId!,
        data: {
          effort,
          justification: "Some justification",
          taskId: params?.taskId!,
        },
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

      const { data: estimations } = await getEstimationsByTaskId({
        taskId: params?.taskId!,
        teamMembersIds,
      });

      if (estimations?.length === teamMembersIds.length) {
        const efforts = estimations
          .filter((e) => e.effort && e.effort > 0)
          .map((e: Estimation) => e.effort) as Array<
          NonNullable<Task["effort"]>
        >;

        const calculatedEffort =
          efforts.length === 1
            ? efforts[0]
            : (calculateMedian(efforts) + calculateMode(efforts)) /
              efforts.length;

        await updateTaskEffort({
          calculatedEffort,
          taskId: params?.taskId!,
        });
      }

      return json({});
    }

    case "PATCH": {
      return json({});
    }

    default: {
      throw new Error(`Method ${request.method} is currently not supported`);
    }
  }
};

export const loader: LoaderFunction = async ({ params, request }) => {
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

  const { data: estimations } = await getEstimationsByTaskId({
    taskId: params?.taskId!,
    teamMembersIds,
  });

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

  const { user, supabase } = useSupabaseClient();

  useEffect(() => {
    if (!supabase) return;

    const subscription = getEstimationsTableSubscription({
      callback: () => {
        fetcher.submit(null, { method: "patch" });
      },
      client: supabase,
    });

    return () => {
      supabase.removeSubscription(subscription);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const { product } = useParams();

  return (
    <Stack>
      <Heading>{`Estimating task: "${task.name}"`}</Heading>
      {task.effort ? (
        <Heading
          color={`${product}.400`}
          size="md"
        >{`This task's effort is ${Number(task.effort)}`}</Heading>
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
                      <Button
                        key={effortOption}
                        as={Button}
                        type="submit"
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
                      </Button>
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
            <Box key={profile.id}>
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
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default EstimateTaskRoute;

const calculateMedian = (arr: Array<number>) => {
  const { length } = arr;

  arr.sort((a, b) => a - b);

  if (length % 2 === 0) {
    return (arr[length / 2 - 1] + arr[length / 2]) / 2;
  }

  return arr[(length - 1) / 2];
};

const calculateMode = (arr: Array<number>) => {
  const mode: Record<string, number> = {};
  let max = 0,
    count = 0;

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    if (mode[item]) {
      mode[item]++;
    } else {
      mode[item] = 1;
    }

    if (count < mode[item]) {
      max = item;
      count = mode[item];
    }
  }

  return max;
};
