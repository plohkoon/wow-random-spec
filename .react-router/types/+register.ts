import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/": {};
  "/event": {};
  "/event/new": {};
  "/event/:slug": {
    "slug": string;
  };
  "/event/:slug/edit": {
    "slug": string;
  };
};