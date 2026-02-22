import "~/lib/init.server";

import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server.browser";
import { type HandleDataRequestFunction, ServerRouter } from "react-router";
import type { AppLoadContext, EntryContext } from "react-router";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");

  const stream = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        if (shellRendered) {
          console.error(error);
        }
      },
    }
  );
  shellRendered = true;

  if (isbot(userAgent ?? "")) {
    await stream.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");

  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

export const handleDataRequest: HandleDataRequestFunction = async (
  response
) => {
  return response;
};
