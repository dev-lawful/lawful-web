import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return json<{}>({});
};

const SwitchOrganizationRoute = () => {
  return <h1>SwitchOrganizationRoute</h1>;
};

export default SwitchOrganizationRoute;
