import {
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectPeers,
  useVideo,
} from "@100mslive/react-sdk";
import type { HMSPeer } from "@100mslive/react-sdk";
import { Button } from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const action: ActionFunction = () => {};

const MeetingIndexPage = () => {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const isConnected = useHMSStore(selectIsConnectedToRoom);

  return (
    <>
      <Form>
        <Button
          type="button"
          onClick={() => {
            hmsActions.join({
              userName: "Gian Tester",
              authToken: "",
            });
          }}
        >
          Join
        </Button>
      </Form>
      <h1>Is connected? {isConnected ? "true" : "false"}</h1>
      {isConnected ? (
        <>
          <h2>Peers</h2>
          {peers.map((peer) => (
            <Peer key={peer.id} peer={peer} />
          ))}
        </>
      ) : null}
    </>
  );
};

export default MeetingIndexPage;

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
