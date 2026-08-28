import { http } from "../http/apiClient";
import type {
  AreaResponse,
  AuthResponse,
  BlockedUserResponse,
  ConversationResponse,
  CreateHabitInput,
  DailyActionResponse,
  FriendRequestsResponse,
  FriendResponse,
  HabitResponse,
  IdentityResponse,
  MeResponse,
  MessagePage,
  MessageResponse,
  OnboardingQuestion,
  OnboardingStateResponse,
  OnboardingSubmitResponse,
  PreferencesResponse,
  ProgressBucketRow,
  ProgressDailyRow,
  ProgressSummaryResponse,
  PublicUser,
  RankingPeriod,
  RankingResponse,
  SendFriendRequestResult,
  TodayResponse,
  UserSearchResult,
} from "../http/types";

/**
 * Superfície da API agrupada por domínio. Cada função é um wrapper fino e
 * tipado sobre `http` — as telas nunca montam URL na mão.
 */

export const authApi = {
  register: (input: { email: string; password: string; name: string; username: string }) =>
    http.post<AuthResponse>("/auth/register", input, { auth: false }),

  login: (input: { email: string; password: string; deviceName?: string }) =>
    http.post<AuthResponse>("/auth/login", input, { auth: false }),

  logout: (refreshToken: string) =>
    http.post<void>("/auth/logout", { refreshToken }, { auth: false }),

  forgotPassword: (email: string) =>
    http.post<void>("/auth/forgot-password", { email }, { auth: false }),
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

  complete: (actionId: string, input?: { progressValue?: number; perceivedEnergy?: number }) =>
    http.post<DailyActionResponse>(`/daily-actions/${actionId}/complete`, input ?? {}),

  skip: (actionId: string, reason?: string) =>
    http.post<DailyActionResponse>(`/daily-actions/${actionId}/skip`, { reason }),
};

export const progressApi = {
  summary: () => http.get<ProgressSummaryResponse>("/progress/summary"),
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
};
