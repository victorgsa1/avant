/**
 * Validação de onboarding no cliente — APENAS UX (feedback instantâneo e
 * menos requisições). NÃO é mecanismo de segurança: o backend
 * (`POST /v1/onboarding/answers`) é a autoridade final e revalida tudo.
 *
 * Zero IA aqui também — é só regex/heurística. Os códigos e mensagens
 * espelham `api/src/onboarding/validation`.
 */

export type OnboardingValidationCode =
  | 'VALID'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'SPAM'
  | 'NONSENSE'
  | 'OFFENSIVE'
  | 'SEXUAL_ABUSE'
  | 'HARMFUL_DRUG_CONTENT'
  | 'CRIMINAL_INTENT'
  | 'VIOLENCE'
  | 'PROMPT_INJECTION'
  | 'OUT_OF_SCOPE'
  | 'COOLDOWN';

export interface OnboardingValidationResult {
  valid: boolean;
  code: OnboardingValidationCode;
}

export const ONBOARDING_MIN_LENGTH = 8;
export const ONBOARDING_MAX_LENGTH = 400;

const MESSAGES: Record<OnboardingValidationCode, string> = {
  VALID: '',
  TOO_SHORT: 'Conte um pouco mais para a gente entender o que você quer. Uma frase honesta já basta.',
  TOO_LONG: `Tente resumir sua resposta em até ${ONBOARDING_MAX_LENGTH} caracteres.`,
  SPAM: 'Tente responder de forma sincera para que possamos criar um plano que faça sentido para você.',
  NONSENSE:
    'Tente responder de forma sincera para que possamos criar um plano que faça sentido para você.',
  OFFENSIVE: 'Essa resposta não parece adequada para esta etapa. Tente explicar seu objetivo de outra forma.',
  SEXUAL_ABUSE:
    'Essa resposta não parece adequada para esta etapa. Tente explicar seu objetivo de outra forma.',
  HARMFUL_DRUG_CONTENT:
    'Essa resposta não parece adequada para esta etapa. Tente explicar seu objetivo de outra forma.',
  CRIMINAL_INTENT:
    'Essa resposta não parece adequada para esta etapa. Tente explicar seu objetivo de outra forma.',
  VIOLENCE: 'Essa resposta não parece adequada para esta etapa. Tente explicar seu objetivo de outra forma.',
  PROMPT_INJECTION: 'Essa resposta não parece relacionada ao seu objetivo pessoal. Tente reformulá-la.',
  OUT_OF_SCOPE: 'Essa resposta não parece relacionada ao seu objetivo pessoal. Tente reformulá-la.',
  COOLDOWN: 'Aguarde alguns segundos antes de tentar de novo.',
};

export function messageForCode(code: OnboardingValidationCode): string {
  return MESSAGES[code] ?? MESSAGES.OUT_OF_SCOPE;
}
