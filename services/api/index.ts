import { http } from "../http/apiClient";
import type {
  AdaptationProposal,
  AreaResponse,
  AuthResponse,
  BlockedUserResponse,
  CompetitionListResponse,
  CompetitionResponse,
  CompleteActionResponse,
  ConversationResponse,
  CreateCompetitionInput,
  CreateHabitInput,
  CreateReminderInput,
  DailyActionResponse,
  FriendRequestsResponse,
  FriendResponse,
  GeneratedPlanResponse,
  HabitResponse,
  IdentityResponse,
  InsightResponse,
  MeResponse,
  MessagePage,
  MessageResponse,
  NotificationResponse,
  OnboardingQuestion,
  OnboardingStateResponse,
  OnboardingSubmitResponse,
  PreferencesResponse,
  ProgressBucketRow,
  ProgressDailyRow,
  ProgressOverviewResponse,
  ProgressSummaryResponse,
  PlanAreaKey,
  PlanPreviewResponse,
  PublicUser,
  RankingPeriod,
  RankingResponse,
  ReminderResponse,
  SendFriendRequestResult,
  SessionResponse,
  TodayResponse,
  UserSearchResult,
} from "../http/types";

/**
 * Superfície da API agrupada por domínio. Cada função é um wrapper fino e
 * tipado sobre `http` — as telas nunca montam URL na mão.
 */

export const authApi = {
  register: (input: { email: string; password: string; name: string }) =>
    http.post<AuthResponse>("/auth/register", input, { auth: false }),

  login: (input: { email: string; password: string; deviceName?: string }) =>
    http.post<AuthResponse>("/auth/login", input, { auth: false }),

  logout: (refreshToken: string) =>
    http.post<void>("/auth/logout", { refreshToken }, { auth: false }),

  forgotPassword: (email: string) =>
    http.post<void>("/auth/forgot-password", { email }, { auth: false }),

  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    http.post<void>("/auth/change-password", input),

  sessions: () => http.get<SessionResponse[]>("/auth/sessions"),
  revokeSession: (id: string) => http.delete<void>(`/auth/sessions/${id}`),
  logoutAll: () => http.post<void>("/auth/logout-all"),
};

export const usersApi = {
  me: () => http.get<MeResponse>("/me"),
  updateMe: (input: { name?: string; username?: string; avatarUrl?: string }) =>
    http.patch<MeResponse>("/me", input),
  deleteMe: () => http.delete<void>("/me"),

  getIdentity: () => http.get<IdentityResponse | null>("/me/identity"),
  putIdentity: (input: { statement: string; whyItMatters?: string }) =>
    http.put<IdentityResponse>("/me/identity", input),

  getPreferences: () => http.get<PreferencesResponse>("/me/preferences"),
  updatePreferences: (input: Partial<Omit<PreferencesResponse, "id" | "userId">>) =>
    http.patch<PreferencesResponse>("/me/preferences", input),
};

export const areasApi = {
  list: () => http.get<AreaResponse[]>("/areas"),
  create: (input: { name: string; description?: string; whyImportant?: string; iconKey?: string }) =>
    http.post<AreaResponse>("/areas", input),
  update: (id: string, input: { name?: string; description?: string; whyImportant?: string }) =>
    http.patch<AreaResponse>(`/areas/${id}`, input),
  remove: (id: string) => http.delete<void>(`/areas/${id}`),
};

export const habitsApi = {
  list: (status?: "ACTIVE" | "PAUSED" | "ARCHIVED") =>
    http.get<HabitResponse[]>("/habits", { query: { status } }),
  create: (input: CreateHabitInput) => http.post<HabitResponse>("/habits", input),
  pause: (id: string) => http.post<HabitResponse>(`/habits/${id}/pause`),
  resume: (id: string) => http.post<HabitResponse>(`/habits/${id}/resume`),
  archive: (id: string) => http.post<HabitResponse>(`/habits/${id}/archive`),
};

export const todayApi = {
  get: () => http.get<TodayResponse>("/today"),

  /** Complementar: um toque, sem prova e sem XP. */
  complete: (actionId: string) =>
    http.post<CompleteActionResponse>(`/daily-actions/${actionId}/complete`, {}),

  /** Principal: foto + localização em multipart; a resposta traz a recompensa. */
  completeWithProof: (actionId: string, proof: FormData) =>
    http.post<CompleteActionResponse>(`/daily-actions/${actionId}/complete`, proof, {
      // Foto em rede móvel: o padrão de 20s abortaria no meio do upload.
      timeoutMs: 120_000,
    }),

  skip: (actionId: string, reason?: string) =>
    http.post<DailyActionResponse>(`/daily-actions/${actionId}/skip`, { reason }),
};

export const progressApi = {
  summary: () => http.get<ProgressSummaryResponse>("/progress/summary"),
  overview: () => http.get<ProgressOverviewResponse>("/progress/overview"),
  daily: (range?: { from?: string; to?: string }) =>
    http.get<ProgressDailyRow[]>("/progress/daily", { query: range }),
  weekly: (range?: { from?: string; to?: string }) =>
    http.get<ProgressBucketRow[]>("/progress/weekly", { query: range }),
  monthly: (range?: { from?: string; to?: string }) =>
    http.get<ProgressBucketRow[]>("/progress/monthly", { query: range }),
};

export const friendsApi = {
  list: () => http.get<FriendResponse[]>("/friends"),
  search: (q: string) => http.get<UserSearchResult[]>("/friends/search", { query: { q } }),
  requests: () => http.get<FriendRequestsResponse>("/friends/requests"),
  sendRequest: (username: string) =>
    http.post<SendFriendRequestResult>("/friends/requests", { username }),
  accept: (requestId: string) => http.post<PublicUser>(`/friends/requests/${requestId}/accept`),
  removeRequest: (requestId: string) => http.delete<void>(`/friends/requests/${requestId}`),
  remove: (userId: string) => http.delete<void>(`/friends/${userId}`),
};

export const rankingApi = {
  get: (period: RankingPeriod = "week") =>
    http.get<RankingResponse>("/ranking", { query: { period } }),
};

export const blocksApi = {
  list: () => http.get<BlockedUserResponse[]>("/blocks"),
  block: (userId: string) => http.post<PublicUser>("/blocks", { userId }),
  unblock: (userId: string) => http.delete<void>(`/blocks/${userId}`),
};

export const chatApi = {
  conversations: () => http.get<ConversationResponse[]>("/conversations"),
  conversation: (id: string) => http.get<ConversationResponse>(`/conversations/${id}`),

  createDirect: (userId: string) =>
    http.post<ConversationResponse>("/conversations/direct", { userId }),
  createGroup: (input: { title: string; memberIds: string[] }) =>
    http.post<ConversationResponse>("/conversations/group", input),

  messages: (conversationId: string, cursor?: string, limit = 30) =>
    http.get<MessagePage>(`/conversations/${conversationId}/messages`, {
      query: { cursor, limit },
    }),

  send: (conversationId: string, body: string, clientId?: string) =>
    http.post<MessageResponse>(`/conversations/${conversationId}/messages`, { body, clientId }),

  markRead: (conversationId: string, messageId?: string) =>
    http.post<void>(`/conversations/${conversationId}/read`, { messageId }),

  deleteMessage: (conversationId: string, messageId: string) =>
    http.delete<void>(`/conversations/${conversationId}/messages/${messageId}`),

  addParticipants: (conversationId: string, userIds: string[]) =>
    http.post<ConversationResponse>(`/conversations/${conversationId}/participants`, { userIds }),

  leave: (conversationId: string) => http.post<void>(`/conversations/${conversationId}/leave`),
};

export const onboardingApi = {
  state: () => http.get<OnboardingStateResponse>("/onboarding/answers"),
  submit: (question: OnboardingQuestion, text: string) =>
    http.post<OnboardingSubmitResponse>("/onboarding/answers", { question, text }),

  /**
   * Gera o plano inicial no servidor a partir das respostas aceitas.
   * Idempotente: chamar duas vezes não cria dois planos.
   */
  /** Prévia do plano a partir do que a pessoa escreveu — não grava nada. */
  previewPlan: (area: PlanAreaKey) =>
    http.post<PlanPreviewResponse>("/onboarding/plan/preview", { area }),

  /** Grava o plano (a mesma prévia, se ela ainda vale para as respostas). */
  generatePlan: (area: PlanAreaKey) =>
    http.post<GeneratedPlanResponse>("/onboarding/plan", { area }),

  /** DEV: apaga respostas, identidade e plano ativo para refazer o onboarding. */
  reset: () => http.delete<void>("/onboarding"),
};

export const competitionsApi = {
  list: () => http.get<CompetitionListResponse>("/competitions"),
  get: (id: string) => http.get<CompetitionResponse>(`/competitions/${id}`),
  create: (input: CreateCompetitionInput) =>
    http.post<CompetitionResponse>("/competitions", input),
  invite: (id: string, userIds: string[]) =>
    http.post<CompetitionResponse>(`/competitions/${id}/participants`, { userIds }),
  join: (id: string) => http.post<CompetitionResponse>(`/competitions/${id}/join`),
  decline: (id: string) => http.post<void>(`/competitions/${id}/decline`),
  leave: (id: string) => http.post<void>(`/competitions/${id}/leave`),
  cancel: (id: string) => http.delete<void>(`/competitions/${id}`),
};

export const notificationsApi = {
  list: () => http.get<NotificationResponse[]>("/notifications"),
  markRead: (id: string) => http.post<void>(`/notifications/${id}/read`),
  markOpened: (id: string) => http.post<void>(`/notifications/${id}/open`),

  reminders: () => http.get<ReminderResponse[]>("/notifications/reminders"),
  createReminder: (input: CreateReminderInput) =>
    http.post<ReminderResponse>("/notifications/reminders", input),
  updateReminder: (id: string, input: Partial<CreateReminderInput>) =>
    http.patch<ReminderResponse>(`/notifications/reminders/${id}`, input),
  deleteReminder: (id: string) => http.delete<void>(`/notifications/reminders/${id}`),
};

/**
 * Motor adaptativo. Note que não existe rota de conversa: o app lê
 * propostas que o backend gerou observando comportamento, e responde
 * "adaptar" ou "manter".
 */
export const adaptationsApi = {
  list: () => http.get<AdaptationProposal[]>("/adaptations"),
  history: () => http.get<(AdaptationProposal & { status: string; appliedAt: string | null })[]>(
    "/adaptations/history",
  ),
  evaluate: () => http.post<AdaptationProposal[]>("/adaptations/evaluate"),
  apply: (id: string) => http.post<AdaptationProposal>(`/adaptations/${id}/apply`),
  dismiss: (id: string) => http.post<void>(`/adaptations/${id}/dismiss`),
};

export const insightsApi = {
  list: () => http.get<InsightResponse[]>("/insights"),
  archive: (id: string) => http.post<void>(`/insights/${id}/archive`),
  weekly: () =>
    http.post<{ generated: boolean; insight: InsightResponse | null }>("/insights/weekly"),
};
