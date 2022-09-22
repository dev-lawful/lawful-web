import { Button, Input, Link, Text } from "@chakra-ui/react";
import { fetch, json, redirect, Response } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, Link as RemixLink, useLoaderData } from "@remix-run/react";
import { getOrganizationBySlug, getTeamBySlug } from "~/models";
import { createRoomForTeam, getRoomsByTeam } from "~/models/rooms.server";
import { JWT, UUID4 } from "~/utils";

interface LoaderData {
  roomId: string | undefined;
  teamId: number;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { orgSlug, teamSlug } = params;
  if (!teamSlug || !orgSlug) {
    throw new Response("Team slug or Organization slug isn't defined", {
      status: 404,
    });
  }
  const { data: orgData, error: orgError } = await getOrganizationBySlug(
    orgSlug
  );

  const [organization] = orgData;

  if (!organization || orgError) {
    throw new Response("Organization not found", {
      status: 404,
    });
  }

  const { data: teamData, error: teamError } = await getTeamBySlug({
    slug: teamSlug,
    organizationId: organization.id,
  });

  const [team] = teamData;

  if (!team || teamError) {
    throw new Response("Team not found", {
      status: 404,
    });
  }

  const { data: rooms, error: roomsErrors } = await getRoomsByTeam({
    teamId: team.id,
  });

  if (!rooms || roomsErrors) {
    throw new Response("Room not found", {
      status: 404,
    });
  }

  return json<LoaderData>({ roomId: rooms[0]?.roomId, teamId: team.id });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  //TODO: This is not good, but I didn't want to fetch org and team again
  const { teamId } = Object.fromEntries(formData);
  console.log(teamId);
  if (!teamId || typeof teamId !== "string") {
    throw new Response("Invalid team id");
  }

  const managementToken = JWT.sign(
    {
      access_key: process.env.ONE_HUNDRED_MS_APP_ACCESS_KEY || "",
      type: "management",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    process.env.ONE_HUNDRED_MS_APP_SECRET || "",
    {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: UUID4(),
    }
  );

  let roomId: string;
  try {
    const response = await fetch("https://api.100ms.live/v2/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${managementToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        region: "us",
      }),
    });

    const { id } = await response.json();
    roomId = id as string;
  } catch (error) {
    throw new Error("An error occurred creating the room");
  }

  const { data: roomData, error: roomError } = await createRoomForTeam({
    teamId: Number(teamId),
    roomId: roomId || "",
  });
  const [room] = roomData;
  if (!room || !room.roomId || roomError) {
    throw new Error(roomError || "");
  }

  return redirect(`./${room.roomId}`);
};

const MeetingIndexPage = () => {
  const { roomId, teamId } = useLoaderData<LoaderData>();
  const availableMeeting = !!roomId;

  return availableMeeting ? (
    <>
      <Text>There is a meeting going on right now!</Text>
      <Link as={RemixLink} to={`./${roomId}`}>
        Go to meeting
      </Link>
    </>
  ) : (
    <>
      <Text>Whoops, no meetings yet...</Text>
      <Form method="post">
        <Input type="hidden" value={teamId} name="teamId" />
        <Button type="submit">Start a meeting</Button>
      </Form>
    </>
  );
};

export default MeetingIndexPage;
