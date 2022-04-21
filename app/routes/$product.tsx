import { Outlet } from "@remix-run/react";

const ProductLayoutRoute = () => {
  return (
    <>
      <div>ProductLayoutRoute</div>
      <Outlet />
    </>
  );
};

export default ProductLayoutRoute;
