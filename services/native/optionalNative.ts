import { requireOptionalNativeModule } from "expo";

/**
 * Libs nativas novas só existem no binário depois de um dev build novo.
 * Importar uma delas num binário antigo derruba o app inteiro — o router
 * carrega todas as rotas no boot, e o Metro trata erro de inicialização de
 * módulo como fatal (não dá para envolver o `require` em try/catch). Então
 * checamos o módulo nativo ANTES de carregar a lib.
 */
export function hasNativeModule(name: string): boolean {
  return requireOptionalNativeModule(name) != null;
}

export const NATIVE_UPDATE_MESSAGE = "Atualize o app para usar este recurso.";
