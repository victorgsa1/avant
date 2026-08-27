import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Ring = {
  radius: number;
  strokeWidth: number;
  color: string;
};

type DecorativeRingsProps = {
  size: number;
  rings: Ring[];
  opacity?: number;
};

// Purely decorative concentric-ring background art used behind the hero
// row and the friends section in the v3 design.
export function DecorativeRings({ size, rings, opacity = 1 }: DecorativeRingsProps) {
  const center = size / 2;
  return (
    <View pointerEvents="none" style={{ opacity }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        {rings.map((ring, index) => (
          <Circle key={index} cx={center} cy={center} r={ring.radius} stroke={ring.color} strokeWidth={ring.strokeWidth} />
        ))}
      </Svg>
    </View>
  );
}
