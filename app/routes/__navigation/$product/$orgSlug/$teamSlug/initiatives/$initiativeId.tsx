import { Outlet } from "@remix-run/react";

const InitiativeLayoutRoute = () => {
  return (
    <>
      <div>InitiativeLayoutRoute</div>
      <Outlet />
    </>
  );
};

export default InitiativeLayoutRoute;
