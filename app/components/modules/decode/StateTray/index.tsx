import { Box, Heading, Stack } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { useDrop } from "react-dnd";
import type { BoardState, Task } from "~/_types";

export const StateTray = ({
  children,
  title,
  onDropHandler,
  boardState,
}: PropsWithChildren<{
  title: string;
  boardState: BoardState;
  onDropHandler: (params: { taskId: string; updatedStateId: string }) => void;
}>) => {
  const [, dropRef] = useDrop<Task, unknown, {}>(() => ({
    accept: "TASK",
    drop: (item) => {
      onDropHandler({
        taskId: (item.id as number).toString(),
        updatedStateId: boardState.id.toString(),
      });
    },
  }));

  return (
    <Box ref={dropRef} bgColor="gray.900" p={3} borderRadius={5}>
      <Heading marginBottom={"10"}>{title}</Heading>
      <Stack
        width="20rem"
        minWidth="max-content"
        height="60vh"
        maxHeight="60vh"
        scrollBehavior="smooth"
        spacing={5}
        overflowY="auto"
      >
        {children}
      </Stack>
    </Box>
  );
};
