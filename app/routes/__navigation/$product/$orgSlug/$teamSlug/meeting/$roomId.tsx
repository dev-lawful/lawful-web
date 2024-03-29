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
import type { PropsWithChildren } from "react";
import { json, Response } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useSupabaseClient } from "~/db";
import { UUID4, JWT } from "~/utils";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FaMicrophoneSlash,
  FaMicrophone,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { SpinnerIcon } from "@chakra-ui/icons";

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

  const [hasLeft, setHasLeft] = useState(false);

  const handleLeaveMeeting = async () => {
    if (isConnected) {
      setHasLeft(true);
      await hmsActions.leave();
    }
  };

  const handleJoinMeeting = async () => {
    if (!isConnected) {
      await hmsActions.join({
        userName: user?.email || "",
        authToken,
      });
    }
  };

  const showPreview = !isConnected && !hasLeft;

  useEffect(() => {
    // This effect syncronizes the PREVIEW mode with the room in the server
    const previewRoom = async () => {
      if (showPreview) {
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
  }, [authToken, hmsActions, user, showPreview]);

  useEffect(() => {
    // This effect forces you to leave the room when Unmounting the component, not perfect though
    return () => {
      hmsActions.leave();
    };
  }, [hmsActions]);

  return (
    <>
      {isConnected ? (
        <Meeting peers={peers}>
          <ControlPanel
            onJoin={handleJoinMeeting}
            onLeave={handleLeaveMeeting}
          />
        </Meeting>
      ) : null}
      {showPreview ? (
        <Preview localPeer={localPeer}>
          <ControlPanel
            onJoin={handleJoinMeeting}
            onLeave={handleLeaveMeeting}
          />
        </Preview>
      ) : null}
      <Flex justifyContent="center" alignItems="center" wrap="wrap" gap="2">
        {hasLeft && (
          <Text mt="8">
            Thank you for using our Meetings service, we hope you really enjoyed
            the experience
          </Text>
        )}
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
    <Box>
      <video
        style={{
          width: 300,
          height: 225,
          backgroundColor: "black",
        }}
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width={300}
        height={225}
      />
      <Text>
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </Text>
    </Box>
  );
};

const Preview = ({
  localPeer,
  children,
}: PropsWithChildren<{ localPeer: HMSPeer | undefined }>) => {
  return (
    <VStack mt="8" mb="4">
      <VStack bgColor="gray.700" p="4" borderRadius="lg">
        <Heading as={"h1"} fontSize="medium">
          Preview
        </Heading>
        {localPeer ? <Peer peer={localPeer} /> : <PreviewPlaceholder />}
      </VStack>
      {children}
    </VStack>
  );
};

const PreviewPlaceholder = () => {
  return (
    <>
      <Flex h="225px" w="300px" justifyContent="center" alignItems="center">
        <SpinnerIcon color={"red.200"} boxSize={"70px"} />
      </Flex>
      <Text color={"gray.400"}>Your meeting name</Text>
    </>
  );
};

const Meeting = ({
  peers,
  children,
}: PropsWithChildren<{ peers: Array<HMSPeer> }>) => {
  return (
    <Flex
      direction="column"
      alignItems="center"
      height="calc(100vh - 64px)"
      justifyContent="space-between"
    >
      <Heading as={"h1"} fontSize="large" mt="8" ml="2">
        Meeting members
      </Heading>
      <Flex
        wrap="wrap"
        m="1"
        gap="2"
        justifyContent={"center"}
        overflowY="auto"
      >
        {peers.map((peer) => (
          <Peer key={peer.id} peer={peer} />
        ))}
      </Flex>
      <Box my={4}>{children}</Box>
    </Flex>
  );
};

interface ControlPanelProps {
  onLeave: () => Promise<void>;
  onJoin: () => Promise<void>;
}
const ControlPanel = ({ onLeave, onJoin }: ControlPanelProps) => {
  const isPreview = useHMSStore(selectIsInPreview);
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();
  const isConnected = useHMSStore(selectIsConnectedToRoom);

  return (
    <Flex wrap="wrap" alignItems={"center"} justifyContent="center" gap="2">
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
      {isConnected ? (
        <Button h="12" onClick={onLeave}>
          Leave
        </Button>
      ) : (
        <Button h="12" onClick={onJoin} disabled={!isPreview}>
          Join!
        </Button>
      )}
    </Flex>
  );
};
