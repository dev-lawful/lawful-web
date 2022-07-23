import { getSession } from "~/sessions";
import { supabase } from "./client.server";

export const setAuthToken = async (request: Request) => {
  let session = await getSession(request.headers.get("Cookie"));

  supabase.auth.setAuth(session.get("authenticated")?.accessToken || "");
  // console.log(session.get("authenticated")?.accessToken);

  return session;
};
