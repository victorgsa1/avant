export type WeekDayState = "done" | "today" | "miss" | "next";

export type WeekDay = {
  label: string;
  state: WeekDayState;
};

export type Area = {
  name: string;
  pct: number;
};
