import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type RingProgressProps = {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  trackColor: string;
  progressColor: string;
  children?: ReactNode;
};

// Circular level dial — replaces the v1 design's rectangular XP bar.
export function RingProgress({ size, strokeWidth, progress, trackColor, progressColor, children }: RingProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(1, Math.max(0, progress));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} className="items-center justify-center">
        {children}
      </View>
    </View>
  );
}
