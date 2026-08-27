export type PodiumEntry = {
  place: number;
  name: string;
  initial: string;
  pct: number;
};

export type RankRow = {
  pos: number;
  name: string;
  pct: number;
  move: string;
  isCurrentUser?: boolean;
};

export type Friend = {
  name: string;
  handle: string;
  pct: number;
};

export type GroupAvatar = {
  initial: string;
  isCurrentUser?: boolean;
};

export type SocialTab = "ranking" | "amigos" | "competicoes";
