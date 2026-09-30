import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useWallOfHonor, useClassYearLeaderboard } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import { COLORS, FONTS, RADII, SPACING } from "@/constants/theme";

export default function WallOfHonorScreen() {
  const entries = useWallOfHonor();
  const { ranks } = useClassYearLeaderboard();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Class Year Leaderboard</Text>
      {ranks.length === 0 ? (
        <Text style={styles.empty}>Class totals appear as donors give.</Text>
      ) : (
        ranks.map((rank) => (
          <View key={rank.graduation_year} style={styles.rankRow}>
            <Text style={styles.rankYear}>Class of {rank.graduation_year}</Text>
            <View style={styles.rankRight}>
              <Text style={styles.rankAmount}>{formatCurrency(rank.total_raised)}</Text>
              <Text style={styles.rankDonors}>{rank.donor_count} donors</Text>
            </View>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Wall of Honor</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>
          Be the first donor to appear on the Wall of Honor.
        </Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.id} style={styles.entryRow}>
            <Text style={styles.entryName}>{entry.display_name || "Anonymous"}</Text>
            {entry.graduation_year ? (
              <Text style={styles.entryMeta}>Class of {entry.graduation_year}</Text>
            ) : null}
            {entry.message ? (
              <Text style={styles.entryMessage}>“{entry.message}”</Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.navy,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    backgroundColor: COLORS.cream,
  },
  rankYear: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.navy,
  },
  rankRight: {
    alignItems: "flex-end",
  },
  rankAmount: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gold,
  },
  rankDonors: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(15,31,56,0.50)",
  },
  entryRow: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  entryName: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.navy,
  },
  entryMeta: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(15,31,56,0.50)",
    marginTop: 2,
  },
  entryMessage: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "rgba(15,31,56,0.60)",
    marginTop: SPACING.sm,
  },
  empty: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: "rgba(15,31,56,0.50)",
  },
});
