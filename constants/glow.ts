// O glow de marca dos botões só existe no iOS. No Android o boxShadow colorido
// não vira halo: vira um borrão retangular atrás do botão.
export function buttonGlow(value: string) {
  return process.env.EXPO_OS === "android" ? undefined : value;
}
