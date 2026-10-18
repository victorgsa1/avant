/**
 * Rota de apoio do botão Avant na tab bar nativa do iOS 26: a aba existe só
 * para o UIKit desenhar o círculo de vidro separado à direita da barra (papel
 * `search`). Ela é `disabled` — tocar nunca seleciona esta tela, só dispara o
 * `tabPress` que abre /new-action. Nada aqui chega a aparecer.
 */
export default function AddTab() {
  return null;
}
