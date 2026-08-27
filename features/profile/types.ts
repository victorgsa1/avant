export type AreaKey = "health" | "focus" | "reading";

export type ProfileArea = {
  key: AreaKey;
  name: string;
  line: string;
};

export type AvantPreference = {
  label: string;
  value: string;
  help: string;
};
