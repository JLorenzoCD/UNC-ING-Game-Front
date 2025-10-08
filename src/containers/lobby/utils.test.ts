import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterAll } from "vitest";

import type { Player } from "@/types/player";
import type { UUID } from "@/types/common";

import { fillAndShufflePlayers } from "./utils";

const MAX_PLAYERS = 6;
const mockPlayers: Player[] = [
  {
    id: "101-a-1" as UUID,
    name: "Alice",
    avatar: "alice.png",
    birthday: new Date("1990-01-01"),
  },
  {
    id: "102-b-2" as UUID,
    name: "Bob",
    avatar: "bob.png",
    birthday: new Date("1995-05-15"),
  },
  {
    id: "103-c-3" as UUID,
    name: "Charlie",
    avatar: "charlie.png",
    birthday: new Date("2000-10-20"),
  },
];
const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.1);

describe("fillAndShufflePlayers", () => {
  it("debería rellenar con 'null' hasta 'max_players' (6) si hay pocos jugadores (3)", () => {
    const result = fillAndShufflePlayers(mockPlayers, MAX_PLAYERS);

    expect(result.length).toBe(MAX_PLAYERS);

    const playerCount = result.filter((p) => p !== null).length;
    const nullCount = result.filter((p) => p === null).length;

    expect(playerCount).toBe(mockPlayers.length);
    expect(nullCount).toBe(MAX_PLAYERS - mockPlayers.length);

    // Verifica que todos los jugadores originales estén presentes
    const resultPlayers = result.filter((p) => p !== null);
    expect(resultPlayers).toEqual(expect.arrayContaining(mockPlayers));
  });

  it("no debería rellenar cuando la cantidad de jugadores es igual a 'max_players' (3)", () => {
    const result = fillAndShufflePlayers(mockPlayers, 3); // max_players = 3
    expect(result.length).toBe(3);

    const nullCount = result.filter((p) => p === null).length;
    expect(nullCount).toBe(0);

    // Los jugadores originales estén presentes
    expect(result).toEqual(expect.arrayContaining(mockPlayers));
  });

  it("debería usar el arreglo original (sin cortar) si hay más jugadores que 'max_players' (3 vs 2)", () => {
    const result = fillAndShufflePlayers(mockPlayers, 2); // 3 jugadores, max_players = 2

    // La longitud (debe ser 3, la longitud del input, no 2)
    expect(result.length).toBe(mockPlayers.length);

    // No haya nulos
    const nullCount = result.filter((p) => p === null).length;
    expect(nullCount).toBe(0);
  });

  it("debería mezclar el arreglo resultante de forma aleatoria", () => {
    // Restauramos Math.random para probar la aleatoriedad
    randomSpy.mockRestore();

    const playersToTest: Player[] = [...mockPlayers];
    const testMaxPlayers = 5;
    const initialOrder = [...playersToTest, null, null]; // 5 elementos

    // Intentamos varias veces para asegurarnos de que la mezcla está activa
    let isShuffled = false;
    for (let i = 0; i < 3; i++) {
      const testResult = fillAndShufflePlayers(playersToTest, testMaxPlayers);

      // Verificamos que al menos un intento dé un orden diferente al original
      if (JSON.stringify(testResult) !== JSON.stringify(initialOrder)) {
        isShuffled = true;
        break;
      }
    }

    expect(isShuffled).toBe(true);

    vi.spyOn(Math, "random").mockReturnValue(0.1);
  });

  afterAll(() => {
    randomSpy.mockRestore();
  });
});
