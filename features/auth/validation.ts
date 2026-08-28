/**
 * Validação de formulário no cliente — UX apenas. O backend revalida tudo
 * (`RegisterDto` / `LoginDto` com class-validator) e é a autoridade final.
 * As regras aqui espelham as do servidor para o erro aparecer antes do
 * round-trip.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Informe seu e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "E-mail inválido.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Informe sua senha.";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `A senha precisa de pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (value.length > 128) return "A senha é longa demais.";
  return null;
}

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Como podemos te chamar?";
  if (name.length > 80) return "Use no máximo 80 caracteres.";
  return null;
}

export function validateUsername(value: string): string | null {
  const username = value.trim();
  if (!username) return "Escolha um nome de usuário.";
  if (username.length < 3) return "Use pelo menos 3 caracteres.";
  if (username.length > 30) return "Use no máximo 30 caracteres.";
  if (!USERNAME_PATTERN.test(username)) {
    return "Use apenas letras, números, ponto e underscore.";
  }
  return null;
}

/** Sugere um username a partir do nome — o usuário pode trocar. */
export function suggestUsername(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 22);
  if (base.length < 3) return "";
  return base;
}
