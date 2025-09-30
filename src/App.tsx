import { Navigate } from "react-router";

import { usePlayer } from "./contexts/PlayerContext";

import { FRONTEND_PATHS } from "./constants/frontendPaths";

export default function App() {
  const { player } = usePlayer();

  if (player == null) {
    return <Navigate to={FRONTEND_PATHS.PLAYER_CREATE} replace />;
  }

  return <Navigate to={FRONTEND_PATHS.MATCH_LIST} replace />;
}
