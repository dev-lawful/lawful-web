import { Outlet } from "@remix-run/react";
import { Navbar } from "~/components/ui";

const NavigationLayoutRoute = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default NavigationLayoutRoute;
