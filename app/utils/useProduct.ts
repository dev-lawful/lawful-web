import { useParams, useMatches } from "@remix-run/react";

export const useProduct = () => {
  const { product } = useParams();

  const {
    length,
    [length - 1]: { pathname },
  } = useMatches();

  return product ?? pathname.includes("decode")
    ? "decode"
    : pathname.includes("network")
    ? "network"
    : "lawful";
};
