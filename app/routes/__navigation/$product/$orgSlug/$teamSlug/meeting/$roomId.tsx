import {
  selectIsConnectedToRoom,
  selectPeers,
  useHMSActions,
  useHMSStore,
  useVideo,
  useAVToggle,
} from "@100mslive/react-sdk";
import type { HMSPeer } from "@100mslive/react-sdk";
import { useEffect } from "react";
import { json, Response } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import { useSupabaseClient } from "~/db";
import { UUID4, JWT } from "~/utils";
import { Button, Link } from "@chakra-ui/react";

interface LoaderData {
  authToken: string;
}
export const loader: LoaderFunction = ({ params }) => {
  const { roomId } = params;
  if (!roomId) {
    throw new Response("RoomId not found");
  }

  const payload = {
    access_key: process.env.ONE_HUNDRED_MS_APP_ACCESS_KEY || "",
    room_id: roomId,
    //TODO: This shouls have the user's id
    user_id: (Math.random() * 10000).toString(),
    role: "guest",
    type: "app",
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  };

  const authToken = JWT.sign(
    payload,
    process.env.ONE_HUNDRED_MS_APP_SECRET || "",
    {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: UUID4(),
    }
  );

  return json<LoaderData>({
    authToken,
  });
};

const RoomPage = () => {
  const { authToken } = useLoaderData<LoaderData>();
  const { user } = useSupabaseClient();
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const isConnected = useHMSStore(selectIsConnectedToRoom);

  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();

  useEffect(() => {
    const joinRoom = async () => {
      await hmsActions.join({
        userName: user?.email || "",
        authToken,
      });
    };
    joinRoom();

    return () => {
      hmsActions.leave();
    };
  }, [authToken, hmsActions, user]);

  return (
    <>
      {isConnected ? (
        <>
          <h2>Peers</h2>
          {peers.map((peer) => (
            <Peer key={peer.id} peer={peer} />
          ))}
        </>
      ) : null}
      <div>
        <Button onClick={toggleAudio}>
          {isLocalAudioEnabled ? "Mute" : "Unmute"}
        </Button>
        <Button onClick={toggleVideo}>
          {isLocalVideoEnabled ? "Hide" : "Unhide"}
        </Button>
        <Link as={RemixLink} to="../">
          Leave
        </Link>
      </div>
    </>
  );
};

export default RoomPage;

const Peer = ({ peer }: { peer: HMSPeer }) => {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width={300}
        height={300}
      />
      <div>
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </div>
    </div>
  );
};
