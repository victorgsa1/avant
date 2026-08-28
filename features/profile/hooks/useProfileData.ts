import { useCallback, useMemo } from "react";
import { areasApi, habitsApi, usersApi } from "@/services/api";
import type {
  AreaResponse,
  HabitResponse,
  IdentityResponse,
  PreferencesResponse,
} from "@/services/http/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import type { AreaKey, AvantPreference, ProfileArea } from "../types";

interface ProfilePayload {
  identity: IdentityResponse | null;
  preferences: PreferencesResponse;
  areas: AreaResponse[];
  habits: HabitResponse[];
}

const PACE_LABELS: Record<PreferencesResponse["pace"], string> = {
  GENTLE: "Leve",
  BALANCED: "Equilibrado",
  CHALLENGING: "Intenso",
};

const PACE_HELP: Record<PreferencesResponse["pace"], string> = {
  GENTLE: "O Avant mantém a carga baixa enquanto o hábito não firma.",
  BALANCED: "O Avant ajusta suas ações sem deixá-las fáceis demais.",
  CHALLENGING: "O Avant sobe a régua quando você está em sequência.",
};

const PERIOD_LABELS: Record<PreferencesResponse["preferredPeriod"], string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
  FLEXIBLE: "Flexível",
};

const RECOVERY_LABELS: Record<PreferencesResponse["recoveryMode"], string> = {
  GRADUAL: "Me ajude a voltar aos poucos",
  BALANCED: "Me traga de volta no ritmo normal",
  DIRECT: "Me coloque direto de volta",
};

const RECOVERY_HELP: Record<PreferencesResponse["recoveryMode"], string> = {
  GRADUAL: "Ações menores nos primeiros dias de retomada.",
  BALANCED: "Retoma o plano habitual assim que você volta.",
  DIRECT: "Sem redução: você volta exatamente de onde parou.",
};

/** Mapeia o nome da área para um ícone conhecido; o resto usa o padrão. */
function areaKeyFor(name: string): AreaKey {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  if (/(saude|corpo|treino|fisic)/.test(normalized)) return "health";
  if (/(leitura|estudo|livro|aprend)/.test(normalized)) return "reading";
  if (/(rotina|sono|organiz)/.test(normalized)) return "routine";
  if (/(dinheiro|financ|grana)/.test(normalized)) return "money";
  if (/(relacion|pessoa|familia|amigo)/.test(normalized)) return "people";
  if (/(foco|trabalho|carreira|projeto)/.test(normalized)) return "focus";
  return "generic";
}

function formatMinute(minute: number | null): string | null {
  if (minute === null) return null;
  const hh = String(Math.floor(minute / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function useProfileData() {
  const resource = useAsyncResource<ProfilePayload>(
    useCallback(async () => {
      const [identity, preferences, areas, habits] = await Promise.all([
        usersApi.getIdentity().catch(() => null),
        usersApi.getPreferences(),
        areasApi.list(),
        habitsApi.list("ACTIVE"),
      ]);
      return { identity, preferences, areas, habits };
    }, []),
  );

  const { data } = resource;

  const view = useMemo(() => {
    if (!data) return null;

    const { identity, preferences, areas, habits } = data;

    const profileAreas: ProfileArea[] = areas.map((area) => {
      const count = habits.filter((habit) => habit.areaId === area.id).length;
      return {
        id: area.id,
        key: areaKeyFor(area.name),
        name: area.name,
        line:
          area.whyImportant?.trim() ||
          (count > 0 ? `${count} ${count === 1 ? "ação ativa" : "ações ativas"}` : "Sem ações ativas"),
      };
    });

    const start = formatMinute(preferences.preferredStartMinute);
    const end = formatMinute(preferences.preferredEndMinute);
    const windowHelp =
      start && end
        ? `Entre ${start} e ${end}, sua janela mais consistente.`
        : "Ainda estamos aprendendo seus melhores horários.";

    const avantPreferences: AvantPreference[] = [
      {
        label: "Seu ritmo",
        value: PACE_LABELS[preferences.pace],
        help: PACE_HELP[preferences.pace],
      },
      {
        label: "Horário preferido",
        value: PERIOD_LABELS[preferences.preferredPeriod],
        help: windowHelp,
      },
      {
        label: "Quando eu saio da rotina",
        value: RECOVERY_LABELS[preferences.recoveryMode],
        help: RECOVERY_HELP[preferences.recoveryMode],
      },
    ];

    return {
      identityStatement: identity?.statement ?? null,
      areas: profileAreas,
      avantPreferences,
      appPreferences: ["Notificações", "Rotina e horários", "Privacidade", "Aparência"],
      accountRows: ["Informações pessoais", "E-mail e segurança", "Plano", "Dados e privacidade"],
    };
  }, [data]);

  return { ...resource, view };
}
