import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { Need } from "@/types";
import { URGENCY_LABELS } from "@/types";
import { COLORS, FONTS, RADII, SPACING } from "@/constants/theme";
import { formatCurrency, percentFunded } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { DonationSheet } from "./DonationSheet";

export function NeedCard({ need }: { need: Need }) {
  const [donateOpen, setDonateOpen] = useState(false);
  const router = useRouter();
  const pct = percentFunded(need.raised_amount, need.goal_amount);
  const isFunded = need.status === "funded" || pct >= 100;

  return (
    <View style={styles.card}>
      <Pressable onPress={() => router.push(`/need/${need.id}`)}>
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
        {need.submitted_by_name ? (
          <Text style={styles.postedBy}>Posted by {need.submitted_by_name}</Text>
        ) : null}
        <Text style={styles.description} numberOfLines={3}>
          {need.description}
        </Text>

        <View style={styles.progress}>
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
        </View>
      </Pressable>

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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    padding: SPACING.md,
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
    paddingVertical: 2,
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
    paddingVertical: 2,
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
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.navy,
    marginTop: SPACING.sm,
  },
  postedBy: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "rgba(15,31,56,0.50)",
    marginTop: 2,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(15,31,56,0.70)",
    marginTop: SPACING.sm,
  },
  progress: {
    marginTop: SPACING.md,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  raised: {
    fontFamily: FONTS.body,
    fontSize: 14,
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
    marginTop: 6,
  },
  meta: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(15,31,56,0.50)",
  },
  contribute: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  contributeDisabled: {
    backgroundColor: COLORS.border,
  },
  contributeText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
});
