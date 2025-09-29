import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { HttpServiceProvider } from "./contexts/HttpServiceContext.tsx";
import { WebSocketServiceProvider } from "./contexts/WebSocketServiceContext.tsx";
import { PlayerProvider } from "./contexts/PlayerContext.tsx";

import "./index.css";
import App from "./App.tsx";
import { FRONTEND_PATHS } from "./constants/frontendPaths.ts";
import MainLayout from "./containers/MainLayout.tsx";
import MatchesContainer from "./containers/matches/MatchesContainer.tsx";
import CreateMatchContainer from "./containers/create-match/CreateMatchContainer.tsx";
import LobbyPage from "./containers/LobbyPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HttpServiceProvider>
      <WebSocketServiceProvider>
        <PlayerProvider>
          <BrowserRouter>
            <Routes>
              <Route path={FRONTEND_PATHS.HOME} element={<App />} />
              <Route element={<MainLayout />}>
                <Route
                  path={FRONTEND_PATHS.MATCH_LIST}
                  element={<MatchesContainer />}
                />
                <Route
                  path={FRONTEND_PATHS.MATCH_CREATE}
                  element={<CreateMatchContainer />}
                />
              </Route>
              <Route
                path={FRONTEND_PATHS.MATCH_LOBBY(":matchId")}
                element={<LobbyPage />}
              />
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </WebSocketServiceProvider>
    </HttpServiceProvider>
  </StrictMode>,
);
