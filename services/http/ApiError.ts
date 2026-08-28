/**
 * Erro normalizado da API. O backend responde sempre no formato
 * `{ status, code, message, requestId, path, timestamp }` (GlobalExceptionFilter),
 * então o app pode ramificar por `code` estável em vez de por texto.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Falha de rede/timeout — não chegou resposta do servidor. */
  static network(message = "Não foi possível conectar. Verifique sua internet."): ApiError {
    return new ApiError(0, "NETWORK_ERROR", message);
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Mensagem segura para exibir ao usuário (nunca vaza detalhe interno). */
export function userMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Algo deu errado. Tente novamente.";
}
