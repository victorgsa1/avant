import {
  ONBOARDING_MAX_LENGTH,
  ONBOARDING_MIN_LENGTH,
  OnboardingValidationResult,
} from './types';

/**
 * Subconjunto DELIBERADO das regras do backend: só o que é barato e seguro
 * de checar no cliente para dar feedback na hora (tamanho, spam óbvio,
 * teclado, emoji, injeção óbvia). O nuance de "palavra sensível ≠ inválido"
 * (drogas/crime/sexo com intenção de recuperação) fica 100% no backend —
 * o cliente NUNCA reprova esses casos para não bloquear um desabafo
 * legítimo.
 */

function normalizeBasic(input: string): string {
  return input
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/([!?.,;:_\-*~"'`^º°ª])\1{1,}/g, '$1')
    .trim();
}

function normalizeForMatch(basic: string): string {
  return basic
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const OBVIOUS_INJECTION = [
  /\bignore\b[^.]{0,30}\b(instru|instructions?|prompt|regras?|rules?|acima|previous|above|tudo)\b/,
  /\b(system|developer)\s+(prompt|message|instructions?)\b/,
  /\bprompt\s+do\s+sistema\b/,
  /\byou are now\b|\bact as\b|\bjailbreak\b/,
  /\bfinja que (?:voce|vc) (?:e|eh)\b|\baja como (?:se|uma|um)\b/,
  /\bmostr[ae]\b[^.]{0,20}\b(prompt|instru)\b/,
];

const KEYBOARD_RUNS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'qwerty', 'asdfgh', '1234567890'];

export function localValidateOnboardingAnswer(raw: string): OnboardingValidationResult {
  const basic = normalizeBasic(raw);
  const match = normalizeForMatch(basic);
  const compact = match.replace(/\s+/g, '');
  const alpha = (match.match(/[a-z]/g) ?? []).length;
  const words = match ? match.split(' ') : [];

  if (basic.length > ONBOARDING_MAX_LENGTH) return { valid: false, code: 'TOO_LONG' };
  if (basic.length < ONBOARDING_MIN_LENGTH) return { valid: false, code: 'TOO_SHORT' };
  if (alpha < 3) return { valid: false, code: 'NONSENSE' };

  // caractere repetido: "aaaaaa", "kkkkkk", "!!!!!!"
  if (/(.)\1{5,}/.test(compact)) return { valid: false, code: 'SPAM' };

  // risada
  if (/^(?:k{3,}|(?:ha){3,}|(?:rs){3,}|(?:kk)+|(?:hue){2,})$/.test(compact)) {
    return { valid: false, code: 'SPAM' };
  }

  // teclado
  for (const run of KEYBOARD_RUNS) {
    if (compact.includes(run) && run.length / Math.max(1, compact.length) >= 0.45) {
      return { valid: false, code: 'NONSENSE' };
    }
  }

  // palavras repetidas: "banana banana banana"
  if (words.length >= 3) {
    const unique = new Set(words).size;
    if (unique === 1 || unique / words.length <= 0.4) return { valid: false, code: 'SPAM' };
  }

  // injeção óbvia
  for (const re of OBVIOUS_INJECTION) {
    if (re.test(match)) return { valid: false, code: 'PROMPT_INJECTION' };
  }

  return { valid: true, code: 'VALID' };
}
