import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import type { Need } from "@/types";
import { DONATION_PRESETS, FEE_SPLIT } from "@/types";
import { submitDonation, type DonationResult } from "@/lib/donations";
import { formatCurrency } from "@/lib/utils";
import { COLORS, FONTS, RADII, SPACING } from "@/constants/theme";

type Frequency = "once" | "monthly";

const emailRegex = /.+@.+\..+/;

/**
 * Donation checkout sheet. Mirrors the web DonationModal UX: amount presets,
 * one-time/monthly, anonymous, fee transparency. Mock mode simulates success
 * through `submitDonation()` (no real charge); real mode POSTs to the shared
 * API route that owns Stripe.
 */
export function DonationSheet({
  need,
  open,
  onClose,
}: {
  need: Need;
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"form" | "processing" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DonationResult | null>(null);

  useEffect(() => {
    if (open) {
      setStatus("form");
      setError(null);
      setResult(null);
      setAmount(50);
      setCustomAmount("");
      setFrequency("once");
      setName("");
      setEmail("");
      setAnonymous(false);
      setMessage("");
    }
  }, [open, need?.id]);

  const usingCustom = customAmount !== "";
  const finalAmount = usingCustom ? Number(customAmount) : amount;
  const emailValid = emailRegex.test(email.trim());
  const isValid = Number.isFinite(finalAmount) && finalAmount > 0 && emailValid;
  const schoolAmount = isValid ? Math.round(finalAmount * FEE_SPLIT.school * 100) / 100 : 0;
  const schoolName = need.school?.name ?? "this school";
  const isMock = (process.env.EXPO_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

  async function handleSubmit() {
    if (!isValid || status === "processing") return;
    setStatus("processing");
    setError(null);

    const res = await submitDonation({
      needId: need.id,
      amount: finalAmount,
      isAnonymous: anonymous,
      isRecurring: frequency === "monthly",
      displayName: name.trim() || null,
      email: email.trim(),
      message: message.trim() || null,
    });

    if (res.success) {
      setResult(res);
      setStatus("success");
    } else {
      setError(res.error ?? "Something went wrong. Please try again.");
      setStatus("form");
    }
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={status === "processing" ? undefined : onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.kicker}>Support this need</Text>
            <Pressable
              onPress={onClose}
              disabled={status === "processing"}
              hitSlop={8}
              accessibilityLabel="Close"
            >
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          {status === "success" ? (
            <SuccessView
              need={need}
              finalAmount={finalAmount}
              frequency={frequency}
              isMock={isMock}
              schoolName={schoolName}
              email={email.trim()}
              result={result}
              onClose={onClose}
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>{need.title}</Text>
              <Text style={styles.subtitle}>{schoolName}</Text>

              {/* Amount */}
              <Text style={styles.label}>Amount</Text>
              <View style={styles.presetGrid}>
                {DONATION_PRESETS.map((preset) => {
                  const selected = !usingCustom && amount === preset;
                  return (
                    <Pressable
                      key={preset}
                      style={[styles.preset, selected && styles.presetSelected]}
                      onPress={() => {
                        setAmount(preset);
                        setCustomAmount("");
                      }}
                    >
                      <Text style={[styles.presetText, selected && styles.presetTextSelected]}>
                        {formatCurrency(preset)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Custom amount"
                placeholderTextColor="rgba(15,31,56,0.40)"
                value={customAmount}
                onChangeText={setCustomAmount}
              />

              {/* Frequency */}
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyRow}>
                {(["once", "monthly"] as Frequency[]).map((f) => (
                  <Pressable
                    key={f}
                    style={[styles.frequency, frequency === f && styles.frequencySelected]}
                    onPress={() => setFrequency(f)}
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        frequency === f && styles.frequencyTextSelected,
                      ]}
                    >
                      {f === "once" ? "One-time" : "Monthly"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Donor info */}
              <Text style={styles.label}>Your details</Text>
              <TextInput
                style={styles.input}
                placeholder="Name (optional)"
                placeholderTextColor="rgba(15,31,56,0.40)"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email (required for tax receipt)"
                placeholderTextColor="rgba(15,31,56,0.40)"
                value={email}
                onChangeText={setEmail}
              />
              {email !== "" && !emailValid && (
                <Text style={styles.errorText}>
                  Enter a valid email to receive your tax receipt.
                </Text>
              )}

              {/* Anonymous + message */}
              <View style={styles.anonymousRow}>
                <Switch
                  value={anonymous}
                  onValueChange={setAnonymous}
                  trackColor={{ false: COLORS.border, true: COLORS.gold }}
                  thumbColor={COLORS.white}
                />
                <Text style={styles.anonymousLabel}>
                  Give anonymously (your name will not appear on the Wall of Honor)
                </Text>
              </View>

              {!anonymous && (
                <TextInput
                  style={styles.input}
                  placeholder="Optional message for the Wall of Honor"
                  placeholderTextColor="rgba(15,31,56,0.40)"
                  value={message}
                  maxLength={140}
                  onChangeText={setMessage}
                />
              )}

              {/* Fee transparency */}
              <View style={styles.feeBox}>
                <Text style={styles.feeStrong}>
                  {isValid
                    ? `School receives ${formatCurrency(schoolAmount)} (88%)`
                    : "88% of every donation goes to the school"}
                </Text>
                <Text style={styles.feeText}>
                  7% platform fee · 5% fiscal-sponsor fee · Stripe processing separate.
                  Donations are tax-deductible via Childs Play Foundation, Inc. (501(c)(3)).
                </Text>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable
                style={[styles.submit, (!isValid || status === "processing") && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!isValid || status === "processing"}
              >
                {status === "processing" ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitText}>
                    {isValid ? `Donate ${formatCurrency(finalAmount)}` : "Donate"}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SuccessView({
  need,
  finalAmount,
  frequency,
  isMock,
  schoolName,
  email,
  result,
  onClose,
}: {
  need: Need;
  finalAmount: number;
  frequency: Frequency;
  isMock: boolean;
  schoolName: string;
  email: string;
  result: DonationResult | null;
  onClose: () => void;
}) {
  return (
    <View style={styles.success}>
      <View style={styles.checkCircle}>
        <Text style={styles.check}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Thank you</Text>
      <Text style={styles.successBody}>
        Your {frequency === "monthly" ? "monthly" : "one-time"} donation of{" "}
        <Text style={styles.successAmount}>{formatCurrency(finalAmount)}</Text> to{" "}
        {schoolName} is complete.
      </Text>
      <Text style={styles.successMeta}>
        Supporting “{need.title}”
        {result?.paymentIntentId ? ` · Reference ${result.paymentIntentId}` : ""}
      </Text>
      {email ? (
        <Text style={styles.successMeta}>Your tax receipt will be sent to {email}.</Text>
      ) : null}
      {isMock ? (
        <Text style={styles.previewNote}>Preview — no real payment was processed.</Text>
      ) : null}
      <Pressable style={styles.submit} onPress={onClose}>
        <Text style={styles.submitText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,31,56,0.60)",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: SPACING.lg,
    maxHeight: "92%",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  kicker: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: COLORS.gold,
  },
  close: {
    fontSize: 24,
    color: "rgba(15,31,56,0.50)",
    lineHeight: 26,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.navy,
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: "rgba(15,31,56,0.60)",
    marginTop: 2,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.navy,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  preset: {
    width: "30%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  presetSelected: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  presetText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.navy,
  },
  presetTextSelected: {
    color: COLORS.white,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.navy,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  frequency: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  frequencySelected: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  frequencyText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.navy,
  },
  frequencyTextSelected: {
    color: COLORS.white,
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  anonymousLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "rgba(15,31,56,0.80)",
    flex: 1,
  },
  feeBox: {
    backgroundColor: COLORS.cream,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  feeStrong: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.navy,
    marginBottom: 4,
  },
  feeText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(15,31,56,0.70)",
  },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "#B91C1C",
    marginTop: SPACING.sm,
  },
  submit: {
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  success: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(27,107,66,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    fontSize: 22,
    color: COLORS.green,
  },
  successTitle: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.navy,
    marginTop: SPACING.md,
  },
  successBody: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(15,31,56,0.70)",
    textAlign: "center",
    marginTop: SPACING.md,
  },
  successAmount: {
    fontWeight: "700",
    color: COLORS.navy,
  },
  successMeta: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(15,31,56,0.50)",
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  previewNote: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: "rgba(15,31,56,0.70)",
    backgroundColor: COLORS.cream,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    textAlign: "center",
  },
});
