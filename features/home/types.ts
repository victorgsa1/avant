export type Task = {
  id: number;
  label: string;
  xp: number;
  done: boolean;
};

export type RankingEntry = {
  rank: number;
  name: string;
  initial: string;
  xp: number;
  isCurrentUser?: boolean;
};
