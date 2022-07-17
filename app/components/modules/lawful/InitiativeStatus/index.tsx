import { Badge } from "@chakra-ui/react";
import React from "react";

interface Props {
  dateString: string;
}

export const InitiativeStatus = ({ dateString }: Props) => {
  const date = new Date(dateString);

  const { colorScheme, label } = {
    closed: {
      colorScheme: "red",
      label: "Closed",
    },
    active: {
      colorScheme: "green",
      label: "Active",
    },
  }[date.getTime() > new Date().getTime() ? "active" : "closed"];

  return <Badge colorScheme={colorScheme}>{label}</Badge>;
};
