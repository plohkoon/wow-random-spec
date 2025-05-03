import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/": {};
  "/test": {};
  "/auth/signup": {};
  "/auth/signin": {};
  "/auth/signout": {};
  "/event": {};
  "/event/new": {};
  "/event/:slug": {
    "slug": string;
  };
  "/event/:slug/player/:id": {
    "slug": string;
    "id": string;
  };
  "/event/:slug/team/:id": {
    "slug": string;
    "id": string;
  };
  "/event/:slug/edit": {
    "slug": string;
  };
  "/event/:slug/edit/:id/roll": {
    "slug": string;
    "id": string;
  };
};