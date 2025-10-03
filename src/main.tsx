import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { HttpServiceProvider } from "./contexts/HttpServiceContext";
import { WebSocketServiceProvider } from "./contexts/WebSocketServiceContext";
import { PlayerProvider } from "./contexts/PlayerContext";

import { FRONTEND_PATHS } from "./constants/frontend.ts";

import "./index.css";

import MainLayout from "./containers/MainLayout";
import MatchesContainer from "./containers/matches/MatchesContainer";
import CreateMatchContainer from "./containers/create-match/CreateMatchContainer";
import CreatePlayerContainer from "./containers/create-player/CreatePlayerContainer";

import GameLayout from "./containers/game/GameLayout";
import GameContainer from "./containers/game/GameContainer";
import LobbyContainer from "./containers/lobby/LobbyContainer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PlayerProvider>
        <HttpServiceProvider>
          <WebSocketServiceProvider>
            <Routes>
              <Route element={<MainLayout />}>
                <Route
                  path={FRONTEND_PATHS.MATCH_LIST}
                  index
                  element={<MatchesContainer />}
                />

                <Route
                  path={FRONTEND_PATHS.PLAYER_CREATE}
                  element={<CreatePlayerContainer />}
                />

                <Route
                  path={FRONTEND_PATHS.MATCH_CREATE}
                  element={<CreateMatchContainer />}
                />
              </Route>

              <Route
                path={FRONTEND_PATHS.MATCH_LOBBY(":matchId")}
                element={<LobbyContainer />}
              />

              <Route element={<GameLayout />}>
                <Route
                  path={FRONTEND_PATHS.MATCH_GAME(":matchId")}
                  element={<GameContainer />}
                />
              </Route>
            </Routes>
          </WebSocketServiceProvider>
        </HttpServiceProvider>
      </PlayerProvider>
    </BrowserRouter>
  </StrictMode>,
);
