import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";

function ComebackArrow() {
  const { colors } = useTheme();
  return (
    <Svg width={26} height={10} viewBox="0 0 26 10" fill="none" style={{ marginBottom: 6 }}>
      <Path d="M0 5h20M17 1.4 21 5l-4 3.6" stroke={colors.ember} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

type ComebackInsightCardProps = {
  recoveries: number;
  currentLabel: string;
  /** Null quando não há mês anterior para comparar. */
  previousLabel: string | null;
  improving: boolean;
};

/** Retomadas: quão rápido a pessoa volta depois de um dia perdido. Só afirma o que os dados mostram. */
export function ComebackInsightCard({ recoveries, currentLabel, previousLabel, improving }: ComebackInsightCardProps) {
  const { colors } = useTheme();
  const hasData = recoveries > 0;

  const title = !hasData ? "Retomadas" : improving ? "Você está voltando mais rápido" : "Você sabe retomar";
  const body = hasData
    ? "Tempo médio para voltar depois de um dia que não aconteceu."
    : "Quando um dia não acontecer e você voltar, o Avant mede quão rápido você retoma.";

  return (
    <View className="overflow-hidden rounded-[26px] px-[22px] py-5" style={{ backgroundColor: colors.emberTint }}>
      <AppText family="archivo" weight="extraBold" style={{ fontSize: 16, letterSpacing: -0.3, color: colors.text }}>
        {title}
      </AppText>
      <AppText
        family="manrope"
        weight="medium"
        style={{ fontSize: 13, lineHeight: 18.9, color: colors.emberDeep, marginTop: 6 }}
      >
        {body}
      </AppText>

      {hasData ? (
        <>
          <View className="mt-[18px] flex-row items-baseline" style={{ gap: 12 }}>
            {previousLabel ? (
              <>
                <AppText family="archivo" weight="black" style={{ fontSize: 28, letterSpacing: -1.2, color: colors.emberWarm }}>
                  {previousLabel}
                </AppText>
                <ComebackArrow />
              </>
            ) : null}
            <AppText family="archivo" weight="black" style={{ fontSize: 34, letterSpacing: -1.4, color: colors.ember }}>
              {currentLabel}
            </AppText>
          </View>
          <AppText family="manrope" weight="semiBold" style={{ fontSize: 11.5, color: colors.emberDeep, marginTop: 4 }}>
            tempo médio para retomar
          </AppText>
        </>
      ) : null}

      <View
        className="mt-4 flex-row items-center pt-3.5"
        style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.arcLight }}
      >
        <AppText family="archivo" weight="black" style={{ fontSize: 17, color: colors.text }}>
          {recoveries}
        </AppText>
        <AppText family="manrope" weight="semiBold" style={{ fontSize: 12, color: colors.emberDeep }}>
          {recoveries === 1 ? "retomada nos últimos 30 dias" : "retomadas nos últimos 30 dias"}
        </AppText>
      </View>
    </View>
  );
}
