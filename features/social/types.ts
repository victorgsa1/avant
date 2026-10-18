export type SocialTab = "atividade" | "amigos" | "competicoes";

export const SOCIAL_TABS: { key: SocialTab; label: string }[] = [
  { key: "atividade", label: "Atividade" },
  { key: "amigos", label: "Amigos" },
  { key: "competicoes", label: "Competições" },
];

/** A aba vem da URL (`/social?tab=amigos`) — notificação e link caem na aba certa. */
export function isSocialTab(value: unknown): value is SocialTab {
  return SOCIAL_TABS.some((tab) => tab.key === value);
}
