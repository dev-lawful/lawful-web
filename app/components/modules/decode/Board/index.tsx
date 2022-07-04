import { Stack } from "@chakra-ui/react";

export const Board: React.FC = ({ children }) => {
  return (
    <Stack direction="row" overflowX="auto">
      {children}
    </Stack>
  );
};
