/** Chaves com ícone próprio; qualquer outra área cai no ícone padrão. */
export type AreaKey = "health" | "focus" | "reading" | "routine" | "money" | "people" | "generic";

export type ProfileArea = {
  id: string;
  key: AreaKey;
  name: string;
  line: string;
};

export type AvantPreference = {
  label: string;
  value: string;
  help: string;
};
