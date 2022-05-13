import { Button, ChakraProvider } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node"; // Depends on the runtime you choose
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import React, { useContext, useEffect } from "react";
import { ClientStyleContext, getTheme, ServerStyleContext } from "~/styles";
import { SupabaseClientProvider } from "./db";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Lawful",
  viewport: "width=device-width,initial-scale=1",
});

export let links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstaticom" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
    },
  ];
};

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

interface LoaderData {
  ENV: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  };
}

export const loader = async (): Promise<LoaderData> => {
  return {
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    },
  };
};

export default function App() {
  const { product } = useParams();
  const data = useLoaderData<LoaderData>();
  return (
    <Document>
      <ChakraProvider theme={getTheme(product)}>
        <Button>Goood</Button>
        <Button variant="outline">Goood</Button>
        {data && (
          <SupabaseClientProvider
            value={createClient(
              data.ENV.SUPABASE_URL,
              data.ENV.SUPABASE_ANON_KEY
            )}
          >
            <Outlet />
          </SupabaseClientProvider>
        )}
      </ChakraProvider>
    </Document>
  );
}

export const CatchBoundary = () => {
  return <h1>Invalid Route</h1>;
};
