import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import type { ThemingProps } from "@chakra-ui/react";

export const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
});
const colorSchemeVariants: { [variant: string]: ThemingProps["colorScheme"] } =
  {
    base: "blue",
    network: "red",
    decode: "green",
  };

export const getTheme = (variant?: string) => {
  return extendTheme(
    {
      config: {
        initialColorMode: "dark",
      },
    },
    withDefaultColorScheme({
      colorScheme: variant
        ? colorSchemeVariants[variant]
        : colorSchemeVariants.base,
    })
  );
};
