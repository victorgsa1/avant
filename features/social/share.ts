import * as Linking from "expo-linking";
import { Share } from "react-native";

/** "AB12CD" → "AB1 2CD": mais fácil de ditar e de conferir. */
export function formatJoinCode(code: string): string {
  return code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}

/** Link que abre "Adicionar amigo" já com o @usuário de quem convidou. */
export function friendInviteLink(username: string): string {
  return Linking.createURL("/add-friend", { queryParams: { u: username } });
}

/**
 * Compartilha o código de uma competição. O link abre "Entrar com código"
 * já preenchido; o código vai por extenso para quem preferir digitar.
 * Devolve false se o compartilhamento não abriu.
 */
export async function shareCompetitionCode(title: string, code: string): Promise<boolean> {
  const link = Linking.createURL("/join-competition", { queryParams: { code } });
  try {
    await Share.share({
      message: `Entra comigo em "${title}" no Avant. Código: ${formatJoinCode(code)}\n${link}`,
    });
    return true;
  } catch {
    return false;
  }
}
