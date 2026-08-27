import { useMemo } from "react";
import type { AvantPreference, ProfileArea } from "../types";

// Ported 1:1 from the design's own local-state logic (`DCLogic`), which is
// the only data source for this screen for now (frontend-first pass, no
// backend wiring yet). Swapping in real data later only touches this file.
const AREAS: ProfileArea[] = [
  { key: "health", name: "Saúde", line: "Construir uma rotina mais saudável" },
  { key: "focus", name: "Foco", line: "Trabalhar com mais consistência" },
  { key: "reading", name: "Leitura", line: "Ler com mais frequência" },
];

const AVANT_PREFERENCES: AvantPreference[] = [
  { label: "Seu ritmo", value: "Equilibrado", help: "O Avant ajusta suas ações sem deixá-las fáceis demais." },
  { label: "Horário preferido", value: "Manhã", help: "Entre 8h e 11h, sua janela mais consistente." },
  {
    label: "Quando eu saio da rotina",
    value: "Me ajude a voltar aos poucos",
    help: "Ações menores nos primeiros dias de retomada.",
  },
];

const APP_PREFERENCES = ["Notificações", "Rotina e horários", "Privacidade", "Aparência"];

const ACCOUNT_ROWS = ["Informações pessoais", "E-mail e segurança", "Plano", "Dados e privacidade"];

export function useProfileData() {
  return useMemo(
    () => ({
      areas: AREAS,
      avantPreferences: AVANT_PREFERENCES,
      appPreferences: APP_PREFERENCES,
      accountRows: ACCOUNT_ROWS,
    }),
    [],
  );
}
