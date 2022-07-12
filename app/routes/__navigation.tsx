import { Outlet } from "@remix-run/react";
import { Navbar } from "~/components/ui";

const NavigationLayoutRoute = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default NavigationLayoutRoute;
