import { HMSRoomProvider } from "@100mslive/react-sdk";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader: LoaderFunction = ({ params }) => {
  const { product } = params;

  if (product !== "network") {
    throw new Response("Meeting feature doesn't belong to this product", {
      status: 400,
    });
  }

  return json({});
};
const MeetingLayoutRoute = () => {
  return (
    <HMSRoomProvider>
      <Outlet />
    </HMSRoomProvider>
  );
};

export default MeetingLayoutRoute;
