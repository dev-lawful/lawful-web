import { Outlet } from "@remix-run/react";
import { CustomCatchBoundary, Navbar } from "~/components/ui";

const NavigationLayoutRoute = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default NavigationLayoutRoute;

export const ErrorBoundary = () => {
  return <div>Hola</div>;
};

export const CatchBoundary = CustomCatchBoundary;
