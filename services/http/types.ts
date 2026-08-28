/**
 * Contratos da API do Avant, espelhando os DTOs de resposta do backend
 * (os `*-response.mapper.ts` em `api/src` e os retornos dos services).
 *
 * Mantido manualmente e de propósito: o app só declara o que consome, e
 * qualquer divergência aparece como erro de tipo na tela que usa o campo.
 */

// ----------------------------------------------------------------------
// Auth / usuário
// ----------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Recorte devolvido por `register` / `login` (não é o /me completo). */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  xpTotal: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
  sessionId?: string;
}

export interface MeResponse {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  inviteCode: string;
  level: number;
  xpTotal: number;
  streakCurrent: number;
  streakBest: number;
  emailVerified: boolean;
  createdAt: string;
}

export type UserPace = "GENTLE" | "BALANCED" | "CHALLENGING";
export type PreferredPeriod = "MORNING" | "AFTERNOON" | "EVENING" | "FLEXIBLE";
export type RecoveryMode = "GRADUAL" | "BALANCED" | "DIRECT";

export interface PreferencesResponse {
  id: string;
  userId: string;
  pace: UserPace;
  preferredPeriod: PreferredPeriod;
  preferredStartMinute: number | null;
  preferredEndMinute: number | null;
  recoveryMode: RecoveryMode;
  notificationsEnabled: boolean;
  reminderLeadMinutes: number;
  timezone: string;
  weekStartsOn: number;
  discoverableByUsername: boolean;
}

export interface IdentityResponse {
  id: string;
  userId: string;
  statement: string;
  whyItMatters: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// Áreas e hábitos
// ----------------------------------------------------------------------

export interface AreaResponse {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  whyImportant: string | null;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type HabitStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export type HabitFrequency = "DAILY" | "WEEKLY" | "CUSTOM";
export type ActionVariantType = "MINIMUM" | "STANDARD" | "STRETCH";

export interface HabitResponse {
  id: string;
  userId: string;
  areaId: string | null;
  title: string;
  description: string | null;
  status: HabitStatus;
  frequency: HabitFrequency;
  weeklyTarget: number;
  xpBase: number;
  difficulty: number;
  isAdaptive: boolean;
}

export interface CreateHabitInput {
  title: string;
  description?: string;
  areaId?: string;
  frequency?: HabitFrequency;
  weeklyTarget?: number;
  xpBase?: number;
  difficulty?: number;
  schedules?: { dayOfWeek: number; startMinute?: number; endMinute?: number }[];
  variants?: {
    type: ActionVariantType;
    title: string;
    description?: string;
    targetMinutes?: number;
    xpMultiplier?: number;
  }[];
}

// ----------------------------------------------------------------------
// Hoje / ações diárias
// ----------------------------------------------------------------------

export type DailyActionStatus = "PLANNED" | "COMPLETED" | "SKIPPED" | "MISSED";

export interface DailyActionResponse {
  id: string;
  habit: { id: string; title: string };
  variant: { type: ActionVariantType; title: string } | null;
  titleSnapshot: string;
  time: {
    plannedAt: string | null;
    windowStart: string | null;
    windowEnd: string | null;
  };
  status: DailyActionStatus;
  completedAt: string | null;
  skippedAt: string | null;
  skipReason: string | null;
  progressValue: number | null;
  xp: { possible: number; awarded: number };
}

export interface TodayResponse {
  date: string;
  progress: {
    planned: number;
    completed: number;
    consistencyScore: number;
    streak: number;
  };
  actions: DailyActionResponse[];
  recovery: { startedAt: string; missedDays: number } | null;
  insight: { id: string; type: string; title: string; body: string } | null;
  unreadNotifications: number;
}

// ----------------------------------------------------------------------
// Progresso
// ----------------------------------------------------------------------

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export interface ProgressSummaryResponse {
  currentStreak: number;
  bestStreak: number;
  overallConsistency: number;
  completedActions: number;
  xpTotal: number;
  level: number;
  levelProgress: LevelProgress;
}

export interface ProgressDailyRow {
  date: string;
  planned: number;
  completed: number;
  skipped: number;
  missed: number;
  consistencyScore: number;
  xpEarned: number;
  streakAtEnd: number;
}

export interface ProgressBucketRow {
  period: string;
  planned: number;
  completed: number;
  consistencyScore: number;
  xpEarned: number;
}

// ----------------------------------------------------------------------
// Social: amigos, ranking, bloqueios
// ----------------------------------------------------------------------

export interface PublicUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  xpTotal: number;
  streakCurrent: number;
}

export interface FriendResponse extends PublicUser {
  since: string | null;
}

export interface FriendRequestResponse {
  id: string;
  user: PublicUser;
  createdAt: string;
}

export interface FriendRequestsResponse {
  incoming: FriendRequestResponse[];
  outgoing: FriendRequestResponse[];
}

export type SocialRelation = "self" | "none" | "friends" | "request_sent" | "request_received";

export interface UserSearchResult extends PublicUser {
  relation: SocialRelation;
}

export type SendFriendRequestResult =
  | { status: "requested"; request: FriendRequestResponse }
  | { status: "friends"; friend: PublicUser };

export type RankingPeriod = "week" | "month" | "all";

export interface RankingRow {
  position: number;
  userId: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  streakCurrent: number;
  score: number;
  xp: number;
  isCurrentUser: boolean;
}

export interface RankingResponse {
  period: RankingPeriod;
  range: { from: string | null; to: string };
  me: RankingRow | null;
  next: { name: string; username: string; xpDelta: number } | null;
  rows: RankingRow[];
}

export interface BlockedUserResponse {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  blockedAt: string;
}

// ----------------------------------------------------------------------
// Chat
// ----------------------------------------------------------------------

export type ConversationType = "DIRECT" | "GROUP";
export type ConversationRole = "OWNER" | "ADMIN" | "MEMBER";
export type MessageType = "TEXT" | "SYSTEM";

export interface ChatUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  sender: ChatUser | null;
  type: MessageType;
  body: string;
  clientId: string | null;
  createdAt: string;
  editedAt: string | null;
}

export interface ConversationParticipant extends ChatUser {
  role: ConversationRole;
  joinedAt: string;
}

export interface ConversationResponse {
  id: string;
  type: ConversationType;
  title: string;
  avatarUrl: string | null;
  participants: ConversationParticipant[];
  lastMessage: MessageResponse | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface MessagePage {
  items: MessageResponse[];
  nextCursor: string | null;
}

// ----------------------------------------------------------------------
// Onboarding
// ----------------------------------------------------------------------

export type OnboardingQuestion = "FUTURE_SELF" | "MOTIVATION" | "OBSTACLES";

export type OnboardingSubmitCode =
  | "VALID"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "SPAM"
  | "NONSENSE"
  | "OFFENSIVE"
  | "SEXUAL_ABUSE"
  | "HARMFUL_DRUG_CONTENT"
  | "CRIMINAL_INTENT"
  | "VIOLENCE"
  | "PROMPT_INJECTION"
  | "OUT_OF_SCOPE"
  | "COOLDOWN";

export interface OnboardingAnswerView {
  question: OnboardingQuestion;
  text: string;
  acceptedAt: string | null;
  updatedAt: string;
}

export interface OnboardingSubmitResponse {
  accepted: boolean;
  code: OnboardingSubmitCode;
  message: string;
  invalidAttempts: number;
  cooldownSeconds: number | null;
  answer?: OnboardingAnswerView;
}

export interface OnboardingStateResponse {
  answers: OnboardingAnswerView[];
  state: Record<string, { invalidAttempts: number; cooldownSeconds: number }>;
}
