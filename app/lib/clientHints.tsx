import { getHintUtils } from "@epic-web/client-hints";
import {
  clientHint as colorSchemeHint,
  subscribeToSchemeChange,
} from "@epic-web/client-hints/color-scheme";
import { useRevalidator, useRouteLoaderData } from "react-router";
import * as React from "react";
import type { Route as RootRoute } from "../+types/root";

const hintsUtils = getHintUtils({
  theme: colorSchemeHint,
});

export const { getHints } = hintsUtils;

export function useHints() {
  const rootLoaderData = useRouteLoaderData(
    "root"
  ) as RootRoute.ComponentProps["loaderData"];

  return rootLoaderData.requestInfo.hints;
}

export function ClientHintCheck({ nonce }: { nonce: string }) {
  const { revalidate } = useRevalidator();
  React.useEffect(
    () => subscribeToSchemeChange(() => revalidate()),
    [revalidate]
  );

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}
