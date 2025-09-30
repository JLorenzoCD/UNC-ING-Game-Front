import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import type { Player } from "@/types/player";
import type { UUID } from "@/types/common";

import PlayerCard, { EmptyPlayerPosition } from "./PlayerCard";

import avatar1 from "@/assets/avatars/icono1.png";

const mockPlayer: Player = {
  id: "p-123" as UUID,
  name: "John Doe",
  avatar: avatar1,
  birthday: new Date(),
};

describe("PlayerCard", () => {
  it("should render the player name and avatar", () => {
    render(<PlayerCard player={mockPlayer} />);

    expect(screen.getByText(mockPlayer.name)).toBeInTheDocument();

    const avatarImage = screen.getByRole("img", { name: mockPlayer.name });
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute("src", mockPlayer.avatar);
  });

  it('should render the "Owner" badge when isOwner is true', () => {
    render(<PlayerCard player={mockPlayer} isOwner />);

    const ownerBadge = screen.getByText("Owner");
    expect(ownerBadge).toBeInTheDocument();

    // Estilo especial para el owner del color amarillento
    const articleElement = screen.getByRole("article");
    expect(articleElement).toHaveClass("border-[#feebbd]");
  });

  it('should NOT render the "Owner" badge when isOwner is false or not provided', () => {
    render(<PlayerCard player={mockPlayer} isOwner={false} />);

    expect(screen.queryByText("Owner")).not.toBeInTheDocument();

    // No tiene el estilo especial para el owner del color amarillento
    const articleElement = screen.getByRole("article");
    expect(articleElement).toHaveClass("border-[#810a0c]");
  });

  it('should render the "Me" badge when isMe is true', () => {
    render(<PlayerCard player={mockPlayer} isMe />);

    expect(screen.getByText("Me")).toBeInTheDocument();
  });

  it('should NOT render the "Me" badge when isMe is false or not provided', () => {
    render(<PlayerCard player={mockPlayer} isMe={false} />);

    expect(screen.queryByText("Me")).not.toBeInTheDocument();
  });

  it('should render both "Owner" and "Me" badges when both props are true', () => {
    render(<PlayerCard player={mockPlayer} isOwner isMe />);

    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Me")).toBeInTheDocument();
  });
});

describe("EmptyPlayerPosition", () => {
  it("should render the empty position message", () => {
    render(<EmptyPlayerPosition />);

    expect(screen.getByText("Space for another player")).toBeInTheDocument();
  });

  it("should have the expected class names for styling", () => {
    const { container } = render(<EmptyPlayerPosition />);
    const divElement = container.firstChild; // El div principal

    // Debería de tener este estilo básico
    expect(divElement).toHaveClass("border-2 border-dashed select-none");
  });
});
