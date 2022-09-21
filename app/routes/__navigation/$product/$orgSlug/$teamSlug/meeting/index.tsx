import { Button, Link, Text } from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { Link as RemixLink } from "@remix-run/react";

export const action: ActionFunction = () => {};

const MeetingIndexPage = () => {
  const availableMeeting = false;
  const roomId = "";

  return availableMeeting ? (
    <>
      <Text>There is a meeting going on right now!</Text>
      <Link as={RemixLink} to={`./${roomId}`}>
        Join
      </Link>
    </>
  ) : (
    <>
      <Text>Whoops, no meetings yet...</Text>
      <Button type="button" onClick={() => {}}>
        Start a meeting
      </Button>
    </>
  );
};

export default MeetingIndexPage;
