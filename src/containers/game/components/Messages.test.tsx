import "@testing-library/jest-dom";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@testing-library/user-event";

import type { MatchMessage } from "@/types/message";

import Messages from "./Messages";
import type { Match } from "@/types/match";
import type { UUID } from "@/types/common";

const { mockMatch, mockMessages } = vi.hoisted(() => {
  const mockMatch: Match = {
    id: "match-1" as UUID,
    min_players: 2,
    max_players: 4,
    name: "Test Match",
    status: "IN_PROGRESS",
    owner_id: crypto.randomUUID(),
    current_player_order: 1,
    timer_turn: new Date(),
  };

  const mockMessages: MatchMessage[] = [
    {
      id: "1",
      match_id: "match-1",
      message: "[EVENT] Player 1 has played a card",
      created_at: new Date("2025-11-09T10:00:00Z"),
      event_type: "Early Train To Paddington",
      player_id: crypto.randomUUID(),
      is_system_msg: true,
    },
    {
      id: "2",
      match_id: "match-1",
      message: "[TURN] Player 2 has now the turn",
      created_at: new Date("2025-11-09T10:05:00Z"),
      event_type: "Turn",
      player_id: crypto.randomUUID(),
      is_system_msg: true,
    },
    {
      id: "3",
      match_id: "match-1",
      message: "[SET ] Player 1 has completed a detective set",
      created_at: new Date("2025-11-09T10:10:00Z"),
      event_type: "Mr Satterthwaite",
      player_id: crypto.randomUUID(),
      is_system_msg: true,
    },
  ];

  return {
    mockMessages,
    mockMatch,
  };
});

describe("Messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no messages available", () => {
    render(<Messages match={mockMatch} messages={[]} />);

    expect(screen.getByText("No messages available yet.")).toBeInTheDocument();
    expect(screen.getByTestId("msgs-container")).toHaveClass("opacity-50");
  });

  it("displays most recent message in preview", () => {
    render(<Messages match={mockMatch} messages={mockMessages} />);

    expect(
      screen.getByText(/has completed a detective set/),
    ).toBeInTheDocument();

    expect(screen.queryByText(/has now the turn/)).not.toBeInTheDocument();
  });

  it("opens drawer on button click", async () => {
    const user = userEvent.setup();
    render(<Messages match={mockMatch} messages={mockMessages} />);

    expect(screen.queryByTestId("msgs-drawer")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /completed/i }));

    expect(screen.getByTestId("msgs-drawer")).toBeInTheDocument();
    expect(screen.getByText("Match Messages")).toBeInTheDocument();
  });

  it("displays all messages in drawer sorted by most recent first", async () => {
    const user = userEvent.setup();
    render(<Messages match={mockMatch} messages={mockMessages} />);

    await user.click(screen.getByRole("button"));

    const drawer = screen.getByTestId("msgs-drawer");
    const msgItems = screen.getAllByTestId("msg-item");

    // One msg in preview + 3 msgs in drawer = 4 total
    expect(msgItems).toHaveLength(4);

    // Check drawer msgs (skip first which is the preview)
    const drawerMsgs = Array.from(
      drawer.querySelectorAll('[data-testid="msg-item"]'),
    );
    expect(drawerMsgs[0]).toHaveTextContent(/has completed a detective set/);
    expect(drawerMsgs[1]).toHaveTextContent(/has now the turn/);
    expect(drawerMsgs[2]).toHaveTextContent(/has played a card/);
  });

  it("shows timestamps in drawer messages", async () => {
    const user = userEvent.setup();
    render(<Messages match={mockMatch} messages={mockMessages} />);

    await user.click(screen.getByRole("button"));

    expect(screen.getAllByText(/ago/)).toHaveLength(3);
  });

  it("closes drawer when clicking backdrop", async () => {
    const user = userEvent.setup();
    render(<Messages match={mockMatch} messages={mockMessages} />);

    await user.click(screen.getByRole("button"));
    const drawer = screen.getByTestId("msgs-drawer");
    expect(drawer).toBeInTheDocument();

    await user.click(drawer);

    waitFor(() => {
      expect(screen.queryByTestId("msgs-drawer")).not.toBeInTheDocument();
    });
  });

  it("closes drawer when clicking close button", async () => {
    const user = userEvent.setup();
    render(<Messages match={mockMatch} messages={mockMessages} />);

    await user.click(screen.getByRole("button"));

    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find((btn) => btn.querySelector("svg"));

    await user.click(closeButton!);

    await waitForElementToBeRemoved(() => screen.queryByTestId("msgs-drawer"));
  });

  it("does not close drawer when clicking inside drawer content", async () => {
    const user = userEvent.setup();
    render(<Messages match={mockMatch} messages={mockMessages} />);

    await user.click(screen.getByRole("button"));

    const drawerContent =
      screen.getByText("Match Messages").parentElement?.parentElement;
    await user.click(drawerContent!);

    expect(screen.getByTestId("msgs-drawer")).toBeInTheDocument();
  });

  it("uses fixed positioning for modal overlay", async () => {
    const user = userEvent.setup();
    render(<Messages match={mockMatch} messages={mockMessages} />);

    await user.click(screen.getByRole("button"));

    const drawer = screen.getByTestId("msgs-drawer");
    expect(drawer).toHaveClass("fixed");
  });

  it("positions container absolutely in top-right corner", () => {
    render(<Messages match={mockMatch} messages={mockMessages} />);

    const container = screen.getByTestId("msgs-container");
    expect(container).toHaveClass("absolute", "top-2", "right-2");
  });
});
