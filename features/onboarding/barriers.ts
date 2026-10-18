/**
 * Opções do passo "O que costuma atrapalhar?".
 *
 * A pergunta continua sendo de texto livre na API (`OBSTACLES`): as opções
 * marcadas viram uma frase, e o "Outro motivo" entra no fim. `text` é o que
 * vai para o servidor — escrito para casar com as palavras-chave que o motor
 * usa para classificar barreiras (engine/domain/friction.ts): "Cansaço"
 * sozinho não casa com nada, "falta de energia" casa.
 */
export const BARRIER_OPTIONS = [
  { id: "time", label: "Falta de tempo", text: "Falta de tempo" },
  { id: "tired", label: "Cansaço", text: "Cansaço, falta de energia" },
  { id: "forget", label: "Esquecimento", text: "Esquecimento" },
  { id: "start", label: "Não sei por onde começar", text: "Não sei por onde começar" },
  { id: "discouraged", label: "Desânimo", text: "Desanimo quando não vejo resultado" },
  { id: "phone", label: "Distração com o celular", text: "Distração com o celular" },
] as const;

export type BarrierId = (typeof BARRIER_OPTIONS)[number]["id"];

/** Tamanho máximo do "Outro motivo", para a frase final caber no limite da API (400). */
export const BARRIER_OTHER_MAX_LENGTH = 200;

/** A resposta que vai para a API: opções marcadas, na ordem da tela, e o "Outro motivo". */
export function composeBarriersAnswer(selected: readonly BarrierId[], other: string): string {
  const chosen = BARRIER_OPTIONS.filter((option) => selected.includes(option.id)).map((option) => option.text);
  return [...chosen, other.trim()].filter(Boolean).join("; ");
}
