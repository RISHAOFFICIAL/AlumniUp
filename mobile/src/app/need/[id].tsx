import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNeeds } from "@/hooks";
import { URGENCY_LABELS } from "@/types";
import { COLORS, FONTS, RADII, SPACING } from "@/constants/theme";
import { formatCurrency, percentFunded } from "@/lib/utils";
import { ProgressBar } from "@/components/ProgressBar";
import { DonationSheet } from "@/components/DonationSheet";

export default function NeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { needs } = useNeeds();
  const [donateOpen, setDonateOpen] = useState(false);

  const need = needs.find((n) => n.id === id);

  if (!need) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Need not found.</Text>
      </View>
    );
  }

  const pct = percentFunded(need.raised_amount, need.goal_amount);
  const isFunded = need.status === "funded" || pct >= 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tags}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{need.category}</Text>
        </View>
        <View
          style={[
            styles.urgencyTag,
            need.urgency === "high"
              ? styles.urgencyHigh
              : need.urgency === "med"
              ? styles.urgencyMed
              : styles.urgencyLow,
          ]}
        >
          <Text style={styles.urgencyText}>{URGENCY_LABELS[need.urgency]}</Text>
        </View>
      </View>

      <Text style={styles.title}>{need.title}</Text>
      <Text style={styles.school}>{need.school?.name}</Text>
      {need.submitted_by_name ? (
        <Text style={styles.postedBy}>
          Posted by {need.submitted_by_name}
          {need.submitted_by_title ? ` · ${need.submitted_by_title}` : ""}
        </Text>
      ) : null}

      <Text style={styles.description}>{need.description}</Text>

      <View style={styles.progressCard}>
        <View style={styles.amountRow}>
          <Text style={styles.raised}>{formatCurrency(need.raised_amount)}</Text>
          <Text style={styles.goal}>of {formatCurrency(need.goal_amount)}</Text>
        </View>
        <ProgressBar percent={pct} />
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{pct}% funded</Text>
          <Text style={styles.meta}>
            {need.backer_count} donor{need.backer_count !== 1 ? "s" : ""}
          </Text>
        </View>
        {need.minimum_amount ? (
          <Text style={styles.minimum}>
            Minimum to begin: {formatCurrency(need.minimum_amount)}
          </Text>
        ) : null}
      </View>

      <Pressable
        style={[styles.contribute, isFunded && styles.contributeDisabled]}
        onPress={() => setDonateOpen(true)}
        disabled={isFunded}
      >
        <Text style={styles.contributeText}>
          {isFunded ? "Fully Funded" : "Contribute"}
        </Text>
      </Pressable>

      <DonationSheet need={need} open={donateOpen} onClose={() => setDonateOpen(false)} />
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  empty: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: "rgba(15,31,56,0.60)",
  },
  tags: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTag: {
    backgroundColor: COLORS.cream,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  categoryText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy,
  },
  urgencyTag: {
    borderRadius: RADII.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  urgencyHigh: {
    backgroundColor: "rgba(184,136,42,0.20)",
    borderColor: "rgba(184,136,42,0.60)",
  },
  urgencyMed: {
    backgroundColor: "rgba(184,136,42,0.10)",
    borderColor: "rgba(184,136,42,0.40)",
  },
  urgencyLow: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.border,
  },
  urgencyText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navy,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.navy,
  },
  school: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: "rgba(15,31,56,0.60)",
  },
  postedBy: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "rgba(15,31,56,0.50)",
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(15,31,56,0.75)",
  },
  progressCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    padding: SPACING.md,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  raised: {
    fontFamily: FONTS.body,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy,
  },
  goal: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: "rgba(15,31,56,0.60)",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  meta: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(15,31,56,0.50)",
  },
  minimum: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(15,31,56,0.50)",
    marginTop: 8,
  },
  contribute: {
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  contributeDisabled: {
    backgroundColor: COLORS.border,
  },
  contributeText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
});
