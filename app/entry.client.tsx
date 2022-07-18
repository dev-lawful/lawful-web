import { RemixBrowser } from "@remix-run/react";
import { ClientCacheProvider } from "./styles";

import * as ReactDOMClient from "react-dom/client";

ReactDOMClient.hydrateRoot(
  document,
  <ClientCacheProvider>
    <RemixBrowser />
  </ClientCacheProvider>
);
