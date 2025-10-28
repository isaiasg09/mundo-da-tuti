import { AuthProvider } from "@/context/AuthContext";
import { RegistrationProvider } from "@/context/RegistrationContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";
import AchievementNotification from "../components/achievementnotification";
import {
    AchievementProvider,
    useAchievementContext,
} from "../context/AchievementContext";
import { GameProvider } from "../context/GameContext";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
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
    <AuthProvider>
      <AchievementProvider>
        <GameProvider>
          <RegistrationProvider>
            <StatusBar style="light" hidden={true} />
            <Stack
              screenOptions={{
                headerShown: false,
                navigationBarHidden: true,
                statusBarHidden: true,
              }}
            >
              <Stack.Screen name="index" />
            </Stack>
            <AchievementNotificationWrapper />
          </RegistrationProvider>
        </GameProvider>
      </AchievementProvider>
    </AuthProvider>
  );
}

// Componente wrapper para mostrar notificações
function AchievementNotificationWrapper() {
  const {
    currentNotification,
    isShowingNotification,
    hideCurrentNotification,
    showNextNotification,
    hasPendingNotifications,
  } = useAchievementContext();

  // Auto-mostrar próxima notificação quando há pendências
  useEffect(() => {
    if (hasPendingNotifications) {
      const timer = setTimeout(() => {
        showNextNotification();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasPendingNotifications, showNextNotification]);

  if (!currentNotification || !isShowingNotification) {
    return null;
  }

  return (
    <AchievementNotification
      achievement={currentNotification}
      visible={isShowingNotification}
      onHide={hideCurrentNotification}
    />
  );
}
