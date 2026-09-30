import { View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: COLORS.gold,
  },
});
