import { BrandTopBar } from "@/components/navigation/BrandTopBar";

type HomeTopBarProps = {
  avatarInitial: string;
  onPressBell?: () => void;
  hasNotification?: boolean;
};

/** A barra do topo da Hoje — a mesma das outras abas (`BrandTopBar`). */
export function HomeTopBar({ avatarInitial, onPressBell, hasNotification = true }: HomeTopBarProps) {
  return <BrandTopBar name={avatarInitial} hasNotification={hasNotification} onPressBell={onPressBell} />;
}
