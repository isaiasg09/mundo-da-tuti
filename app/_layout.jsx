import { AuthProvider } from "@/context/AuthContext";
import { RegistrationProvider } from "@/context/RegistrationContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";
import AchievementNotification from "../components/achievementnotification";
import {
  AchievementProvider,
  useAchievementContext,
} from "../context/AchievementContext";
import { GameProvider } from "../context/GameContext";

// Importar e disponibilizar o logger globalmente muito cedo
import { logger } from "../utils/logger";
if (typeof global !== "undefined") {
  global.logger = logger;
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error Boundary capturou erro:", error);
    console.error("🚨 Error Info:", errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, textAlign: "center", margin: 20 }}>
            😞 Oops! Algo deu errado.
          </Text>
          <Text style={{ color: "#fff", fontSize: 14, textAlign: "center", margin: 10 }}>
            Erro: {this.state.error && this.state.error.toString()}
          </Text>
          <Text style={{ color: "#fff", fontSize: 12, textAlign: "center", margin: 10 }}>
            Reinicie o aplicativo para tentar novamente.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <Text style={{ color: "#fff" }}>Carregando fontes...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
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
