import { BarsIcon, BookIcon, ClockIcon, FocusIcon, HeartIcon, PeopleIcon } from "@/components/ui/icons";
import { GridIcon } from "@/components/ui/icons/settings";
import type { SettingsIcon } from "./components/SettingsGroup";

/**
 * Ícone de cada área pelo nome que a pessoa deu. A área não guarda ícone
 * próprio (o `iconKey` vem vazio para as criadas à mão), então o nome
 * decide; o que não casar com nada fica com a grade.
 */
const RULES: [RegExp, SettingsIcon][] = [
  [/(saude|corpo|treino|fisic)/, HeartIcon],
  [/(leitura|estudo|livro|aprend)/, BookIcon],
  [/(rotina|sono|organiz)/, ClockIcon],
  [/(dinheiro|financ|grana)/, BarsIcon],
  [/(relacion|pessoa|familia|amigo)/, PeopleIcon],
  [/(foco|trabalho|carreira|projeto)/, FocusIcon],
];

export function areaIconFor(name: string): SettingsIcon {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return RULES.find(([pattern]) => pattern.test(normalized))?.[1] ?? GridIcon;
}
