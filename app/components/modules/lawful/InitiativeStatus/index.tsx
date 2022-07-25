import { Badge } from "@chakra-ui/react";

export type Status = "active" | "closed";
interface Props {
  status: Status;
}

export const InitiativeStatus = ({ status }: Props) => {
  const { colorScheme, label } = {
    closed: {
      colorScheme: "red",
      label: "Closed",
    },
    active: {
      colorScheme: "green",
      label: "Active",
    },
  }[status];

  return <Badge colorScheme={colorScheme}>{label}</Badge>;
};
