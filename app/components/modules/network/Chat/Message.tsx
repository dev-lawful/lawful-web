import { Text } from "@chakra-ui/react";
import type { VFC } from "react";

export const Message: VFC<{ text: string }> = ({ text }) => {
  return <Text>{text}</Text>;
};
