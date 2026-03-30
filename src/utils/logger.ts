import { APP_NAME } from "@/constants";
import signale from "signale"

export const logger = new signale.Signale({
    scope: APP_NAME,
    types: {
    commit: {
      badge: "◉",
      color: "cyan",
      label: "commit",
      logLevel: "info",
    },
  },
});