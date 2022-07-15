import { getSession } from "~/sessions";
import { supabase } from "./client.server";

export const setAuthToken = async (request: Request) => {
  let session = await getSession(request.headers.get("Cookie"));

  supabase.auth.setAuth(session.get("access_token"));
  // console.log(session.get("access_token"));

  return session;
};
