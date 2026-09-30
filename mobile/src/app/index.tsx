import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNeeds } from "@/hooks";
import { CATEGORIES } from "@/types";
import type { Need, School } from "@/types";
import { COLORS, FONTS, RADII, SPACING } from "@/constants/theme";
import { formatCurrency } from "@/lib/utils";
import { NeedCard } from "@/components/NeedCard";

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { needs, loading } = useNeeds();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const groupedNeeds: Record<string, { school: School; needs: Need[] }> = {};
  needs.forEach((need) => {
    if (selectedCategory && need.category !== selectedCategory) return;
    if (
      searchQuery &&
      !(need.school?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
      return;

    const schoolId = need.school_id;
    if (!groupedNeeds[schoolId]) {
      groupedNeeds[schoolId] = { school: need.school!, needs: [] };
    }
    groupedNeeds[schoolId].needs.push(need);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.previewBanner}>
        <Text style={styles.previewText}>
          Preview — sample data for demonstration. No real donations have occurred.
        </Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search by school name..."
        placeholderTextColor="rgba(15,31,56,0.40)"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        <Chip label="All" active={selectedCategory === ""} onPress={() => setSelectedCategory("")} />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <Text style={styles.empty}>Loading needs...</Text>
      ) : (
        Object.entries(groupedNeeds).map(([schoolId, group]) => {
          const schoolTotalRaised = group.needs.reduce((sum, n) => sum + n.raised_amount, 0);
          const schoolTotalGoal = group.needs.reduce((sum, n) => sum + n.goal_amount, 0);
          return (
            <View key={schoolId} style={styles.schoolGroup}>
              <View style={styles.schoolHeader}>
                <View style={styles.schoolHeaderLeft}>
                  <Text style={styles.schoolName}>{group.school.name}</Text>
                  <Text style={styles.schoolMeta}>
                    {group.needs.length} active need{group.needs.length !== 1 ? "s" : ""}
                  </Text>
                </View>
                <View style={styles.schoolTotals}>
                  <Text style={styles.schoolRaised}>{formatCurrency(schoolTotalRaised)}</Text>
                  <Text style={styles.schoolMeta}>raised of {formatCurrency(schoolTotalGoal)}</Text>
                </View>
              </View>
              {group.needs.map((need) => (
                <NeedCard key={need.id} need={need} />
              ))}
            </View>
          );
        })
      )}

      {Object.keys(groupedNeeds).length === 0 && !loading && (
        <Text style={styles.empty}>No needs found matching your filters.</Text>
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
    gap: SPACING.md,
  },
  previewBanner: {
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  previewText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.navy,
    textAlign: "center",
  },
  search: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.navy,
    backgroundColor: COLORS.white,
  },
  chipsRow: {
    flexGrow: 0,
  },
  chipsContent: {
    gap: SPACING.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  chipText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.navy,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  schoolGroup: {
    gap: SPACING.sm,
  },
  schoolHeader: {
    backgroundColor: COLORS.navy,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  schoolHeaderLeft: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  schoolName: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  schoolMeta: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.60)",
    marginTop: 2,
  },
  schoolTotals: {
    alignItems: "flex-end",
  },
  schoolRaised: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gold,
  },
  empty: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: "rgba(15,31,56,0.60)",
    textAlign: "center",
    paddingVertical: SPACING.xl,
  },
});
