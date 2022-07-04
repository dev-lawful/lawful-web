import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

const colorSchemeVariants: {
  lawful: "lawful";
  network: "network";
  decode: "decode";
} = {
  lawful: "lawful",
  network: "network",
  decode: "decode",
};

export const getTheme = (variant?: string) => {
  const variantKey =
    variant === "decode" || variant === "network" ? variant : "lawful";
  return extendTheme(
    {
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
      colors: {
        lawful: {
          "50": "#ECF2F9",
          "100": "#CADCED",
          "200": "#A8C5E1",
          "300": "#85AED5",
          "400": "#6397CA",
          "500": "#4181BE",
          "600": "#346798",
          "700": "#274D72",
          "800": "#1A334C",
          "900": "#0D1A26",
        },
        network: {
          "50": "#FDE8EB",
          "100": "#F9BDC7",
          "200": "#F693A3",
          "300": "#F2697F",
          "400": "#EF3E5B",
          "500": "#EB1436",
          "600": "#BC102C",
          "700": "#8D0C21",
          "800": "#5E0816",
          "900": "#2F040B",
        },
        decode: {
          "50": "#EDF8F5",
          "100": "#CBEBE3",
          "200": "#AADFD1",
          "300": "#89D2BF",
          "400": "#68C5AD",
          "500": "#46B99B",
          "600": "#38947C",
          "700": "#2A6F5D",
          "800": "#1C4A3E",
          "900": "#0E251F",
        },
      },
      config: {
        initialColorMode: "dark",
      },
    },
    withDefaultColorScheme({
      colorScheme: colorSchemeVariants[variantKey],
    })
  );
};
