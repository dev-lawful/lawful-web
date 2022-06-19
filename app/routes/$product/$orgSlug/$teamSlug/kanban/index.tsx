import { List, ListItem } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useMatches } from "@remix-run/react";
import { getBoardsByTeamId } from "~/models";
import type { Board } from "~/_types";

interface LoaderData {
  data: {
    boards: Array<Board>;
    url: string;
  };
}

export const loader: LoaderFunction = async ({ request: { url } }) => {
  // TODO: make teamId dynamic given the current team
  const { data: boards, error } = await getBoardsByTeamId(1);

  if (error) throw new Error(error);

  return json<LoaderData>({
    data: {
      boards,
      url,
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
      {boards.map(({ id, name }) => {
        const { pathname: boardPathname } = new URL(`${pathname}${id}`, url);

        return (
          <Link key={id} to={boardPathname}>
            <ListItem>{name}</ListItem>
          </Link>
        );
      })}
    </List>
  );
};

export default KanbanIndexRoute;
