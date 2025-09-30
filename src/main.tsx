import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { HttpServiceProvider } from "./contexts/HttpServiceContext";
import { WebSocketServiceProvider } from "./contexts/WebSocketServiceContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { FRONTEND_PATHS } from "./constants/frontendPaths.ts";

import "./index.css";

import App from "./App";

import MainLayout from "./containers/MainLayout";
import MatchesContainer from "./containers/matches/MatchesContainer";
import CreateMatchContainer from "./containers/create-match/CreateMatchContainer";
import CreatePlayerContainer from "./containers/create-player/CreatePlayerContainer";

import GameLayout from "./containers/game/layout";
import GameContainer from "./containers/game/index";
import LobbyContainer from "./containers/lobby/LobbyContainer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlayerProvider>
      <HttpServiceProvider>
        <WebSocketServiceProvider>
          <BrowserRouter>
            <Routes>
              <Route path={FRONTEND_PATHS.HOME} element={<App />} />

              <Route element={<MainLayout />}>
                <Route
                  path={FRONTEND_PATHS.PLAYER_CREATE}
                  element={<CreatePlayerContainer />}
                />
                <Route
                  path={FRONTEND_PATHS.MATCH_LIST}
                  element={<MatchesContainer />}
                />
                <Route
                  path={FRONTEND_PATHS.MATCH_CREATE}
                  element={<CreateMatchContainer />}
                />
              </Route>
              <Route element={<GameLayout />}>
                <Route
                  path={FRONTEND_PATHS.MATCH_GAME(":matchId")}
                  element={<GameContainer />}
                />
              </Route>
              <Route
                path={FRONTEND_PATHS.MATCH_LOBBY(":matchId")}
                element={<LobbyContainer />}
              />
            </Routes>
          </BrowserRouter>
        </WebSocketServiceProvider>
      </HttpServiceProvider>
    </PlayerProvider>
  </StrictMode>,
);
