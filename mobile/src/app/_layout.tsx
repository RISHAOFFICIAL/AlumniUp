import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS, FONTS } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.navy },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontFamily: FONTS.heading, fontWeight: "600" },
          contentStyle: { backgroundColor: COLORS.white },
        }}
      >
        <Stack.Screen name="index" options={{ title: "AlumniUp" }} />
        <Stack.Screen name="need/[id]" options={{ title: "Need" }} />
        <Stack.Screen name="login" options={{ title: "Sign in" }} />
        <Stack.Screen name="wall-of-honor" options={{ title: "Wall of Honor" }} />
      </Stack>
    </>
  );
}
