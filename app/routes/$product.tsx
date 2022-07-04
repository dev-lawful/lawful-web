import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Box, Flex } from "@chakra-ui/react";

export const loader: LoaderFunction = ({ params }) => {
  if (!["decode", "network"].includes(params.product || "")) {
    return redirect("/");
  }
  return json({});
};

const ProductLayoutRoute = () => {
  return (
    <Flex direction="column" height="full">
      <div>ProductLayoutRoute</div>
      <div>Custon Theme</div>
      <div>Navbar and footer</div>
      <Outlet />
    </Flex>
  );
};

export default ProductLayoutRoute;
