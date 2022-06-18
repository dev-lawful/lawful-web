import { List, ListItem, Stack } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useMatches } from "@remix-run/react";
import { supabase } from "~/db";
import type { Board } from "~/_types";

interface LoaderData {
  data: {
    boards: Array<Board>;
    url: string;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const { data: boards, error } = await supabase
    .from<Board>("boards")
    .select("*")
    // TODO: make teamId dynamic given the current team
    .eq("teamId", 1);

  if (error) throw new Error(error.message);

  return json<LoaderData>({
    data: {
      boards,
      url: request.url,
    },
  });
};

const KanbanIndexRoute = () => {
  const {
    data: { boards, url },
  } = useLoaderData<LoaderData>();

  const matches = useMatches();

  const {
    [matches.length - 1]: { pathname },
  } = matches;

  return (
    <List>
      {boards.map((board) => {
        const { pathname: boardPathname } = new URL(
          `${pathname}${board.id}`,
          url
        );

        return (
          <Link key={board.id} to={boardPathname}>
            <ListItem>{board.name}</ListItem>
          </Link>
        );
      })}
    </List>
  );
};

export default KanbanIndexRoute;
