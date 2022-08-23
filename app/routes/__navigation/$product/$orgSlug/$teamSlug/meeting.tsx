import { HMSRoomProvider } from "@100mslive/react-sdk";
import { Outlet } from "@remix-run/react";

const MeetingLayoutRoute = () => {
  return (
    <HMSRoomProvider>
      <Outlet />
    </HMSRoomProvider>
  );
};

export default MeetingLayoutRoute;
