import { Outlet } from "@remix-run/react";

const ProductLayoutRoute = () => {
  return (
    <>
      <div>ProductLayoutRoute</div>
      <div>Custon Theme</div>
      <div>Navbar and footer</div>
      <Outlet />
    </>
  );
};

export default ProductLayoutRoute;
