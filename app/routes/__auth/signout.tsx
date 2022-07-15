import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
