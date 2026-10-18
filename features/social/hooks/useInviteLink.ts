import { useCallback, useState } from "react";
import { Share } from "react-native";
import { useSession } from "@/features/auth/SessionProvider";
import { friendInviteLink } from "../share";

/**
 * "Convidar por link": compartilha um link que abre "Adicionar amigo" já
 * com o seu @usuário. Quem recebe confirma com um toque — o pedido sai
 * pelo mesmo caminho da busca, então bloqueio e duplicidade valem igual.
 */
export function useInviteLink() {
  const { user } = useSession();
  const [error, setError] = useState<string | null>(null);

  const share = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      await Share.share({
        message: `Bora construir consistência juntos no Avant? Me adiciona: @${user.username}\n${friendInviteLink(user.username)}`,
      });
    } catch {
      setError(`Não deu para abrir o compartilhamento. Passe seu @usuário: @${user.username}`);
    }
  }, [user]);

  return { share, error };
}
