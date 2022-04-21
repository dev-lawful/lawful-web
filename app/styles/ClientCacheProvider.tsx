import React, { useState } from "react";
import { CacheProvider } from "@emotion/react";

import { ClientStyleContext, createEmotionCache } from "~/styles";

interface ClientCacheProviderProps {
  children: React.ReactNode;
}

export function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(createEmotionCache());

  function reset() {
    setCache(createEmotionCache());
  }

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}
