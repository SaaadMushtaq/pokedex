import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1a1a2e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          color: "#fff",
        },
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
