import { useMemo } from "react";
import type { Friend, GroupAvatar, PodiumEntry, RankRow } from "../types";

// Ported 1:1 from the design's own local-state logic (`DCLogic`), which is
// the only data source for this screen for now (frontend-first pass, no
// backend wiring yet). Swapping in real data later only touches this file.
const CURRENT_USER_RANK = 4;
const CURRENT_USER_PCT = 82;
const CURRENT_USER_POSITIONS_GAINED = 2;

const PODIUM: PodiumEntry[] = [
  { place: 2, name: "Rafael", initial: "R", pct: 88 },
  { place: 1, name: "Lucas", initial: "L", pct: 94 },
  { place: 3, name: "Marina", initial: "M", pct: 85 },
];

const RANK_ROWS: RankRow[] = [
  { pos: 4, name: "Você", pct: 82, move: "↑ 2", isCurrentUser: true },
  { pos: 5, name: "Matheus", pct: 78, move: "↓ 1" },
  { pos: 6, name: "Rafael C.", pct: 71, move: "" },
  { pos: 7, name: "Bia", pct: 66, move: "↑ 3" },
];

const FRIENDS: Friend[] = [
  { name: "João Martins", handle: "@joaom", pct: 84 },
  { name: "Pedro Silva", handle: "@pedro", pct: 79 },
  { name: "Lucas Faria", handle: "@lucasf", pct: 94 },
  { name: "Marina Reis", handle: "@mari", pct: 85 },
  { name: "Bia Nunes", handle: "@bianun", pct: 66 },
];

const GROUP_AVATARS: GroupAvatar[] = [
  { initial: "G", isCurrentUser: true },
  { initial: "J" },
  { initial: "P" },
  { initial: "L" },
];

export function useRankingData() {
  return useMemo(
    () => ({
      currentUserRank: CURRENT_USER_RANK,
      currentUserPct: CURRENT_USER_PCT,
      currentUserPositionsGained: CURRENT_USER_POSITIONS_GAINED,
      podium: PODIUM,
      rankRows: RANK_ROWS,
      friends: FRIENDS,
      groupAvatars: GROUP_AVATARS,
    }),
    [],
  );
}
