import type { UUID } from "./common";

export interface AndThenThereWasOneMoreEventPayload {
  target_player_id: UUID;
  target_secret_id: UUID;
}

export interface AnotherVictimEventPayload {
  target_set_id: UUID;
}

export interface LookIntoTheAshesEventPayload {
  target_card_id: UUID;
}

export interface RegularAndDiscardEventPayload {
  cards_ids: UUID[];
}

export interface CardsOffTheTableEventPayload {
  target_player_id: UUID;
}
