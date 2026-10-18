/**
 * Respostas prontas das perguntas abertas do onboarding.
 *
 * Servem de atalho para quem trava diante do campo vazio: um toque
 * preenche o campo e a pessoa ainda pode editar. Todas precisam passar na
 * validação do cliente e do backend (tamanho, sem repetição, sem gênero
 * presumido).
 */
export const QUICK_ANSWERS = {
  identity: [
    "Quero ser uma pessoa mais saudável e com energia",
    "Quero ter uma rotina organizada e cumprir o que planejo",
    "Quero crescer na carreira e ter reconhecimento pelo meu trabalho",
    "Quero estudar com constância e aprender coisas novas",
    "Quero ter controle do meu dinheiro e sair das dívidas",
    "Quero me dedicar mais à música e à minha arte",
  ],
  motivation: [
    "Quero sentir orgulho de quem eu sou",
    "Quero ser exemplo para minha família",
    "Cansei de começar e parar no meio do caminho",
    "Quero me sentir bem no corpo e na cabeça",
    "Quero ter mais tranquilidade no dia a dia",
  ],
  // Barreiras não têm respostas prontas: o passo é uma lista de opções (ver barriers.ts).
} as const;

export type QuickAnswerKey = keyof typeof QUICK_ANSWERS;
