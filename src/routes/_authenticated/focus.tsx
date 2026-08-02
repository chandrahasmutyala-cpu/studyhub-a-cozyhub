import { createFileRoute, redirect } from "@tanstack/react-router";

/** Focus mode now lives inside the Planner. */
export const Route = createFileRoute("/_authenticated/focus")({
  beforeLoad: () => {
    throw redirect({ to: "/tasks" });
  },
});
