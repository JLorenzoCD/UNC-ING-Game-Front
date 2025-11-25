import "@testing-library/jest-dom";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@testing-library/user-event";

import type { MatchLog } from "@/types/log";

import Logs from "./Logs";

const { mockuseBasicGame, mockLogs } = vi.hoisted(() => {
  const mockLogs: MatchLog[] = [
    {
      id: "1",
      match_id: "match-1",
      message: "[EVENT] Player 1 has played a card",
      created_at: new Date("2025-11-09T10:00:00Z"),
      event_type: "Early Train To Paddington",
      player_id: crypto.randomUUID(),
    },
    {
      id: "2",
      match_id: "match-1",
      message: "[TURN] Player 2 has now the turn",
      created_at: new Date("2025-11-09T10:05:00Z"),
      event_type: "Turn",
      player_id: crypto.randomUUID(),
    },
    {
      id: "3",
      match_id: "match-1",
      message: "[SET ] Player 1 has completed a detective set",
      created_at: new Date("2025-11-09T10:10:00Z"),
      event_type: "Mr Satterthwaite",
      player_id: crypto.randomUUID(),
    },
  ];

  const mockuseBasicGame = vi.fn();

  return {
    mockuseBasicGame,
    mockLogs,
  };
});

vi.mock("@/contexts/BasicGameContext", () => ({
  useBasicGame: mockuseBasicGame,
}));

describe("Logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockuseBasicGame.mockReturnValue({ logs: mockLogs });
  });

  it("renders empty state when no logs available", () => {
    mockuseBasicGame.mockReturnValue({ logs: [] });
    render(<Logs />);

    expect(screen.getByText("No logs available yet.")).toBeInTheDocument();
    expect(screen.getByTestId("logs-container")).toHaveClass("opacity-50");
  });

  it("displays most recent log in preview", () => {
    render(<Logs />);

    expect(
      screen.getByText(/has completed a detective set/),
    ).toBeInTheDocument();

    expect(screen.queryByText(/has now the turn/)).not.toBeInTheDocument();
  });

  it("opens drawer on button click", async () => {
    const user = userEvent.setup();
    render(<Logs />);

    expect(screen.queryByTestId("logs-drawer")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /completed/i }));

    expect(screen.getByTestId("logs-drawer")).toBeInTheDocument();
    expect(screen.getByText("Match Logs")).toBeInTheDocument();
  });

  it("displays all logs in drawer sorted by most recent first", async () => {
    const user = userEvent.setup();
    render(<Logs />);

    await user.click(screen.getByRole("button"));

    const drawer = screen.getByTestId("logs-drawer");
    const logItems = screen.getAllByTestId("log-item");

    // One log in preview + 3 logs in drawer = 4 total
    expect(logItems).toHaveLength(4);

    // Check drawer logs (skip first which is the preview)
    const drawerLogs = Array.from(
      drawer.querySelectorAll('[data-testid="log-item"]'),
    );
    expect(drawerLogs[0]).toHaveTextContent(/has completed a detective set/);
    expect(drawerLogs[1]).toHaveTextContent(/has now the turn/);
    expect(drawerLogs[2]).toHaveTextContent(/has played a card/);
  });

  it("shows timestamps in drawer logs", async () => {
    const user = userEvent.setup();
    render(<Logs />);

    await user.click(screen.getByRole("button"));

    expect(screen.getAllByText(/ago/)).toHaveLength(3);
  });

  it("closes drawer when clicking backdrop", async () => {
    const user = userEvent.setup();
    render(<Logs />);

    await user.click(screen.getByRole("button"));
    const drawer = screen.getByTestId("logs-drawer");
    expect(drawer).toBeInTheDocument();

    await user.click(drawer);

    expect(screen.queryByTestId("logs-drawer")).not.toBeInTheDocument();
  });

  it("closes drawer when clicking close button", async () => {
    const user = userEvent.setup();
    render(<Logs />);

    await user.click(screen.getByRole("button"));

    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find((btn) => btn.querySelector("svg"));

    await user.click(closeButton!);

    await waitForElementToBeRemoved(() => screen.queryByTestId("logs-drawer"));
  });

  it("does not close drawer when clicking inside drawer content", async () => {
    const user = userEvent.setup();
    render(<Logs />);

    await user.click(screen.getByRole("button"));

    const drawerContent =
      screen.getByText("Match Logs").parentElement?.parentElement;
    await user.click(drawerContent!);

    expect(screen.getByTestId("logs-drawer")).toBeInTheDocument();
  });

  it("uses fixed positioning for modal overlay", async () => {
    const user = userEvent.setup();
    render(<Logs />);

    await user.click(screen.getByRole("button"));

    const drawer = screen.getByTestId("logs-drawer");
    expect(drawer).toHaveClass("fixed");
  });

  it("positions container absolutely in top-right corner", () => {
    render(<Logs />);

    const container = screen.getByTestId("logs-container");
    expect(container).toHaveClass("absolute", "top-2", "right-2");
  });
});
