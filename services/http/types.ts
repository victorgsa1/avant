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
export type PlanTier = "FREE" | "PRO";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  xpTotal: number;
  /** Na fase inicial todo cadastro é PRO — ver docs/MONETIZACAO.md. */
  plan: PlanTier;
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
  /** Intervenções decididas pelo motor comportamental. */
  behavioralNotificationsEnabled: boolean;
  socialNotificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  /** Minutos desde 00:00 no fuso do usuário. 22:00 = 1320. */
  quietHoursStart: number;
  quietHoursEnd: number;
  /** Teto diário de intervenções. Null = usa o padrão do servidor. */
  behavioralDailyLimit: number | null;
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
  role: HabitRole;
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

export type HabitRole = "PRIMARY" | "COMPLEMENTARY";

export interface DailyActionResponse {
  id: string;
  /** PRIMARY: compromisso do dia (prova + XP). COMPLEMENTARY: sem prova e sem XP. */
  role: HabitRole;
  /** `iconKey`: o desenho escolhido quando o plano nasceu. Null em hábitos antigos. */
  habit: { id: string; title: string; iconKey: string | null };
  variant: { type: ActionVariantType; title: string } | null;
  /**
   * Todas as versões do hábito — é daqui que o card tira o "Mínimo".
   * Opcional porque servidores anteriores a este campo não o enviam.
   */
  variants?: { type: ActionVariantType; title: string; minutes: number | null; xp: number }[];
  titleSnapshot: string;
  /** Duração da versão do dia, quando medida em minutos. */
  minutes: number | null;
  proof: { capturedAt: string | null } | null;
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

/** O que a conclusão da principal rendeu. Null quando nada foi concedido agora. */
export interface CompletionReward {
  xp: number;
  leveledUp: boolean;
  xpTotal: number;
  level: LevelProgress;
  streak: number;
}

export interface CompleteActionResponse extends DailyActionResponse {
  reward: CompletionReward | null;
}

export interface TodayResponse {
  date: string;
  /** "Quem eu quero me tornar", do plano. */
  identity: string | null;
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
  /** A principal pausada pela pessoa — sem ela, o dia fica sem compromisso. */
  pausedPrimary: { id: string; title: string } | null;
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

export type WeekDayStateResponse = "done" | "miss" | "today" | "next" | "rest";
export type ExecutionPeriod = "MORNING" | "AFTERNOON" | "EVENING";

/** `GET /v1/progress/overview` — a tela de Progresso inteira, calculada no servidor. */
export interface ProgressOverviewResponse {
  identity: string | null;
  streak: { current: number; best: number };
  consistency: {
    pct: number;
    /** Null sem mês anterior para comparar. */
    deltaPct: number | null;
    /** Consistência acumulada dia a dia nos últimos 30 dias (0..100). */
    series: number[];
    startDate: string;
    endDate: string;
  };
  week: { days: { date: string; state: WeekDayStateResponse }[]; done: number; total: number };
  bestWindow: { period: ExecutionPeriod; share: number; sample: number } | null;
  comeback: {
    recoveries: number;
    avgDaysToReturn: number | null;
    previousAvgDaysToReturn: number | null;
  };
  areas: { id: string; name: string; pct: number | null }[];
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

// ----------------------------------------------------------------------
// Competições
// ----------------------------------------------------------------------

export type CompetitionStatus = "DRAFT" | "UPCOMING" | "ACTIVE" | "FINISHED" | "CANCELLED";
export type CompetitionParticipantStatus = "INVITED" | "ACTIVE" | "DECLINED" | "LEFT";

export interface CompetitionStanding {
  position: number;
  userId: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  /** Consistência média no período (0..100). */
  score: number;
  plannedCount: number;
  completedCount: number;
  daysScored: number;
  status: CompetitionParticipantStatus;
  isCurrentUser: boolean;
}

export interface CompetitionResponse {
  id: string;
  title: string;
  description: string | null;
  metric: "CONSISTENCY";
  status: CompetitionStatus;
  startDate: string;
  endDate: string;
  startAt: string;
  endAt: string;
  daysTotal: number;
  daysElapsed: number;
  daysRemaining: number;
  creator: { id: string; name: string; username: string };
  isCreator: boolean;
  myStatus: CompetitionParticipantStatus | null;
  myPosition: number | null;
  myScore: number;
  participantCount: number;
  maxParticipants: number;
  standings: CompetitionStanding[];
  pendingInvites: { userId: string; name: string; username: string }[];
}

export interface CompetitionListResponse {
  invites: CompetitionResponse[];
  ongoing: CompetitionResponse[];
  upcoming: CompetitionResponse[];
  finished: CompetitionResponse[];
}

export interface CreateCompetitionInput {
  title: string;
  description?: string;
  startDate?: string;
  durationDays: 7 | 14 | 30;
  maxParticipants?: number;
  inviteeIds?: string[];
}

// ----------------------------------------------------------------------
// Notificações e lembretes
// ----------------------------------------------------------------------

export type NotificationType =
  | "GENERAL"
  | "REMINDER"
  | "INSIGHT"
  | "RECOVERY"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "COMPETITION_INVITE"
  | "COMPETITION_UPDATE"
  | "BEHAVIORAL_REMINDER"
  | "RESCUE"
  | "COMEBACK"
  | "ACHIEVEMENT"
  | "STREAK"
  | "WEEKLY_PROGRESS"
  | "SOCIAL"
  | "SYSTEM";

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: { route?: string; habitId?: string; conversationId?: string } | null;
  readAt: string | null;
  openedAt: string | null;
  createdAt: string;
}

export interface ReminderResponse {
  id: string;
  title: string;
  description: string | null;
  /** Minuto do dia (0..1439) no fuso do lembrete. 19:00 = 1140. */
  minuteOfDay: number;
  timezone: string;
  /** 0=domingo … 6=sábado. */
  daysOfWeek: number[];
  isEnabled: boolean;
  habitId: string | null;
  lastSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  minuteOfDay: number;
  timezone?: string;
  daysOfWeek?: number[];
  isEnabled?: boolean;
  habitId?: string;
}

// ----------------------------------------------------------------------
// Motor adaptativo
// ----------------------------------------------------------------------

export type AdaptationType =
  | "CHANGE_TIME"
  | "REDUCE_ACTION"
  | "INCREASE_ACTION"
  | "CHANGE_VARIANT"
  | "RECOVERY_PLAN"
  | "CHANGE_REMINDER"
  | "CHANGE_FREQUENCY";

export interface AdaptationProposal {
  id: string;
  type: AdaptationType;
  strategy: string | null;
  title: string;
  message: string;
  habitId: string | null;
  habitTitle: string | null;
  /** RULE = regra determinística; AI = hipótese do modelo já validada. */
  source: "RULE" | "MODEL" | "AI";
  confidence: number | null;
  evidence: Record<string, unknown> | null;
  createdAt: string;
  expiresAt: string | null;
  applyLabel: string;
}

export interface InsightResponse {
  id: string;
  type: string;
  source: "RULE" | "MODEL" | "AI";
  title: string;
  body: string;
  confidence: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
}

// ----------------------------------------------------------------------
// Segurança da conta
// ----------------------------------------------------------------------

export interface SessionResponse {
  id: string;
  deviceName: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
}

// ----------------------------------------------------------------------
// Plano inicial (onboarding)
// ----------------------------------------------------------------------

export type PlanAreaKey =
  | "saude"
  | "rotina"
  | "trabalho"
  | "estudos"
  | "financas"
  | "relacionamentos"
  | "criatividade"
  | "outro";

export interface PlanHabit {
  title: string;
  areaName: string;
  /** A primeira é a principal do dia; as demais, complementares. */
  role: HabitRole;
  weeklyTarget: number;
  startMinute: number;
  minimumVersion: string;
  standardVersion: string;
  standardMinutes: number | null;
}

export interface GeneratedPlanResponse {
  identity: string;
  /** true quando a IA estruturou; false quando veio do plano determinístico. */
  fromAi: boolean;
  alreadyExisted: boolean;
  habits: (PlanHabit & { id: string })[];
}

/** Prévia mostrada antes de confirmar — nada foi gravado ainda. */
export interface PlanPreviewResponse {
  identity: string;
  fromAi: boolean;
  /** "Você quer ..." — o que a IA entendeu das três respostas; null sem IA. */
  understanding: string | null;
  habits: PlanHabit[];
}
