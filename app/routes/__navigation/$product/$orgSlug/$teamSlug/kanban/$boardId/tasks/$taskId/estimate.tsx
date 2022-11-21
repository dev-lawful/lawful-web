import { Button, Text, Wrap, WrapItem } from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type {
  SupabaseClient,
  SupabaseRealtimePayload,
} from "@supabase/supabase-js";
import { useEffect } from "react";
import { supabase, useSupabaseClient } from "~/db";
import { getOrganizationBySlug, getProfilesByTeamSlug } from "~/models";
import { getSession } from "~/sessions";
import type { Estimation, Profile, UserSession } from "~/_types";

interface LoaderData {
  data: {
    estimations: Array<
      Estimation & {
        profiles: Array<Profile>;
      }
    >;
    teamMembersProfiles: Array<Profile>;
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

  await supabase.from<Estimation>("estimations").insert({
    effort,
    justification: "Some justification",
    taskId: Number(params?.taskId! as string),
    userId: user.id,
  });

  return json({});
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // traer todas las estimaciones de las personas que forman parte de este board

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
  return client.from("estimations").on("INSERT", callback).subscribe();
};

const EstimateTaskRoute = () => {
  const {
    data: { estimations, teamMembersProfiles },
  } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();

  const { user } = useSupabaseClient();

  const currentUserEstimation = estimations.filter((e) => {
    return e.userId === user?.id!;
  })?.[0];

  const userVoted = !!currentUserEstimation;

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

  return (
    <div>
      <h1>Estimating task</h1>
      {teamMembersProfiles.map((u) => {
        const { effort, justification } = currentUserEstimation;

        if (user?.id === u.id) {
          return (
            <div key={u.id}>
              <Wrap>
                {u.firstName} {u.lastName} (You)
              </Wrap>
              <Wrap as={fetcher.Form} method="post">
                {[1, 2, 3, 5, 8, 13].map((effortOption) => {
                  const userVotedOption = userVoted
                    ? effort === effortOption
                    : null;

                  return (
                    <WrapItem
                      key={effortOption}
                      as={Button}
                      type={userVoted ? "button" : "submit"}
                      value={effortOption}
                      name="effort"
                      p={3}
                      border={userVotedOption ? "1px solid red" : "none"}
                    >
                      {effortOption}
                    </WrapItem>
                  );
                })}
              </Wrap>
              {userVoted ? <Text>{justification}</Text> : null}
            </div>
          );
        }

        return (
          <div key={u.id}>
            <Wrap>
              {u.firstName} {u.lastName}
            </Wrap>
            <Wrap>
              {[1, 2, 3, 5, 8, 13].map((effort) => {
                return (
                  <WrapItem key={effort} as={Button} type="button" p={3}>
                    {effort}
                  </WrapItem>
                );
              })}
            </Wrap>
            |
          </div>
        );
      })}
    </div>
  );
};

// const EffortCard = ({
//   effort,
//   isVoted = false,
// }: {
//   effort: number;
//   isVoted?: boolean;
// }) => {
//   return <></>;
// };

export default EstimateTaskRoute;
