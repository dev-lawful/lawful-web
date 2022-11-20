import {
  selectIsConnectedToRoom,
  selectPeers,
  selectIsInPreview,
  selectLocalPeer,
  useHMSActions,
  useHMSStore,
  useVideo,
  useAVToggle,
} from "@100mslive/react-sdk";
import type { HMSPeer } from "@100mslive/react-sdk";
import { useEffect, useState } from "react";
import { json, Response } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useSupabaseClient } from "~/db";
import { UUID4, JWT } from "~/utils";
import { Button, Flex, Icon } from "@chakra-ui/react";
import {
  FaMicrophoneSlash,
  FaMicrophone,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

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
  const localPeer = useHMSStore(selectLocalPeer);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const isPreview = useHMSStore(selectIsInPreview);
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();

  const [hasLeft, setHasLeft] = useState(false);

  useEffect(() => {
    // This effect syncronizes the PREVIEW mode with the room in the server
    const previewRoom = async () => {
      if (!isConnected && !hasLeft) {
        await hmsActions.preview({
          userName: user?.email || "",
          authToken,
          settings: {
            isAudioMuted: true,
            isVideoMuted: false,
          },
        });
      }
    };

    previewRoom();
  }, [authToken, hmsActions, user, isConnected, hasLeft]);

  useEffect(() => {
    // This effect forces you to leave the room when Unmounting the component, not perfect though
    return () => {
      hmsActions.leave();
    };
  }, [hmsActions]);

  return (
    <>
      {isConnected ? <Meeting peers={peers} /> : null}
      {isPreview && localPeer ? <Preview localPeer={localPeer} /> : null}
      <Flex justifyContent="center" alignItems="center" wrap="wrap" gap="2">
        <Icon
          as={isLocalAudioEnabled ? FaMicrophone : FaMicrophoneSlash}
          onClick={toggleAudio}
          w="12"
          h="12"
          p="2"
          color={isLocalAudioEnabled ? undefined : "red.300"}
          bgColor="gray.700"
          _hover={{ bgColor: "gray.600" }}
          cursor="pointer"
          borderRadius="md"
        />
        <Icon
          as={isLocalVideoEnabled ? FaVideo : FaVideoSlash}
          onClick={toggleVideo}
          w="12"
          h="12"
          p="2"
          color={isLocalVideoEnabled ? undefined : "red.300"}
          bgColor="gray.700"
          _hover={{ bgColor: "gray.600" }}
          cursor="pointer"
          borderRadius="md"
        />
        <Button
          onClick={async () => {
            if (!isConnected) {
              await hmsActions.join({
                userName: user?.email || "",
                authToken,
              });
            }
          }}
        >
          JOIN
        </Button>
        <Button
          onClick={async () => {
            if (isConnected) {
              setHasLeft(true);
              await hmsActions.leave();
            }
          }}
        >
          Leave
        </Button>
      </Flex>
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

const Preview = ({ localPeer }: { localPeer: HMSPeer }) => {
  return (
    <>
      <h2>Preview</h2>
      <Peer peer={localPeer} />
    </>
  );
};

const Meeting = ({ peers }: { peers: Array<HMSPeer> }) => {
  return (
    <>
      <h2>Peers</h2>
      {peers.map((peer) => (
        <Peer key={peer.id} peer={peer} />
      ))}
    </>
  );
};
