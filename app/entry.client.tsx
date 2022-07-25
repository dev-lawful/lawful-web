import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";
import { ClientCacheProvider } from "./styles";

hydrate(
  <ClientCacheProvider>
    <RemixBrowser />
  </ClientCacheProvider>,
  document
);
