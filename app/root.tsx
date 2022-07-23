import { ChakraProvider } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"; // Depends on the runtime you choose
import { json } from "@remix-run/node";
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
import React, { useContext, useEffect } from "react";
import { ClientStyleContext, getTheme, ServerStyleContext } from "~/styles";
import { SupabaseClientProvider, useCreateSupabaseClient } from "./db";
import { getSession } from "./sessions";
import type { UserSession } from "./_types";

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
      <html lang="en" style={{ height: "100%" }}>
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
        <body style={{ height: "100%" }}>
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
  userSession?: UserSession;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userSession = session.get("authenticated") as UserSession | undefined;
  return json<LoaderData>({
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    },
    userSession,
  });
};

export default function App() {
  const { product } = useParams();

  const { ENV, userSession } = useLoaderData<LoaderData>();

  const supabaseClient = useCreateSupabaseClient({
    supabaseUrl: ENV.SUPABASE_URL,
    supabaseAnonKey: ENV.SUPABASE_ANON_KEY,
    userSession,
  });

  return (
    <Document>
      <ChakraProvider theme={getTheme(product)}>
        <SupabaseClientProvider value={supabaseClient}>
          <Outlet />
        </SupabaseClientProvider>
      </ChakraProvider>
    </Document>
  );
}

export const CatchBoundary = () => {
  return <h1>Invalid Route</h1>;
};

export const ErrorBoundary = () => {
  return <h1>Error</h1>;
};
