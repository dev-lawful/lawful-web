import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { supabase } from "~/db";
import { getSession, destroySession, commitSession } from "~/sessions";
import type { UserSession } from "~/_types";

// this is just for supabase realtime session refresh
export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const oldUserSession = session.get("authenticated") as UserSession;

  if (!oldUserSession.refreshToken)
    throw new Response("Refresh token not found", { status: 400 });

  const { data, error } = await supabase.auth.api.refreshAccessToken(
    oldUserSession.refreshToken
  );

  if (!data || error) {
    return redirect("/signin", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  const newUserSession = data && {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    userId: data.user?.id ?? "",
    email: data.user?.email ?? "",
    expiresIn: data.expires_in ?? -1,
    expiresAt: data.expires_at ?? -1,
  };

  session.set("authenticated", newUserSession);

  return json(
    {},
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
