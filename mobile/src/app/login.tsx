import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { COLORS, FONTS, RADII, SPACING } from "@/constants/theme";

const IS_MOCK = (process.env.EXPO_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

type Mode = "signin" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    if (!/.+@.+\..+/.test(email.trim()) || password.length < 6) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (IS_MOCK) {
      // No auth in preview mode — there is no Supabase backend to talk to.
      setLoading(false);
      setSuccess("Preview — authentication requires Supabase credentials.");
      return;
    }

    const { error: err } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : await supabase.auth.signUp({ email: email.trim(), password });

    setLoading(false);
    if (err) setError(err.message);
    else
      setSuccess(
        mode === "signin"
          ? "Signed in."
          : "Account created. Check your email to confirm."
      );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </Text>
      <Text style={styles.roleNote}>
        Alumni, donors, and school staff all use AlumniUp. Your role (donor, school
        staff, or school admin) is set on your profile after sign-up.
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor="rgba(15,31,56,0.40)"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password (at least 6 characters)"
        placeholderTextColor="rgba(15,31,56,0.40)"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Pressable
        style={[styles.submit, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitText}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.toggle}
        onPress={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setSuccess(null);
        }}
      >
        <Text style={styles.toggleText}>
          {mode === "signin"
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    fontWeight: "600",
    color: COLORS.navy,
    marginTop: SPACING.md,
  },
  roleNote: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(15,31,56,0.70)",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.navy,
    backgroundColor: COLORS.white,
  },
  error: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: "#B91C1C",
  },
  success: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.green,
  },
  submit: {
    backgroundColor: COLORS.gold,
    borderRadius: RADII.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  toggle: {
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  toggleText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.gold,
  },
});
