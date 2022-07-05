import { Outlet } from "@remix-run/react";

const AuthLayoutRoute = () => {
  return (
    <div>
      AuthLayoutRoute
      <Outlet />
    </div>
  );
};

export default AuthLayoutRoute;
