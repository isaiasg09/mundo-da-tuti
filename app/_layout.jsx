import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View, Text } from "react-native";
import "react-native-reanimated";
import { RegistrationProvider } from "../context/RegistrationContext";
import { GameProvider } from "../context/GameContext";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "enter",
};

export default function RootLayout() {
  const [loaded] = useFonts({
    RoundsBlack: require("../assets/fonts/RoundsBlack.otf"),
    TTMilksCasualPie: require("../assets/fonts/ttmilkscasualpiebase.otf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View>
        <Text>carregando</Text>
      </View>
    );
  }

  return (
    <GameProvider>
      <RegistrationProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            navigationBarHidden: true,
            statusBarHidden: true,
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </RegistrationProvider>
    </GameProvider>
  );
}
