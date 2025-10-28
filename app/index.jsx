import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image as RNImage,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../context/AuthContext";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

const longBackground = require("../assets/images/bg_1.png");
const logoImage = require("../assets/images/textologo.png");

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEnter, setShowEnter] = useState(false);

  // --- Inicializa dimensões da imagem já com fallback ---
  const resolvedSource = RNImage.resolveAssetSource(longBackground);
  const initialImageHeight =
    resolvedSource && resolvedSource.width && resolvedSource.height
      ? (windowWidth / resolvedSource.width) * resolvedSource.height
      : windowHeight;

  const progress = useSharedValue(0);
  const [imageHeight, setImageHeight] = useState(initialImageHeight);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  // --- onLayout da view principal ---
  const onLayoutRootView = (event) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && width !== viewportWidth) setViewportWidth(width);
    if (height > 0 && height !== viewportHeight) setViewportHeight(height);
  };

  // --- Recalcula altura da imagem quando viewportWidth muda ---
  useEffect(() => {
    if (viewportWidth > 0) {
      const source = RNImage.resolveAssetSource(longBackground);
      if (source?.width && source?.height) {
        const scaledHeight = (viewportWidth / source.width) * source.height;
        setImageHeight(isFinite(scaledHeight) ? scaledHeight : -1);
      } else setImageHeight(-1);
    }
  }, [viewportWidth]);

  // --- Redirecionamento se já autenticado ---
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        // console.log("✅ Usuário já está logado, redirecionando para home...");
        router.replace("/home");
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleNavigate = async () => {
    // console.log("🚀 HandleNavigate chamado - Auth status:", {
    //   isAuthenticated,
    //   authLoading,
    // });
    if (authLoading) {
      // console.log("⏳ Ainda carregando autenticação, aguardando...");
      return;
    }
    setLoading(true);
    if (isAuthenticated && user) {
      // console.log("🏠 Usuário logado, indo para home...");
      router.replace("/home");
    } else {
      // console.log("🔄 Navegando para tela de login...");
      router.replace("/login");
    }
    setLoading(false);
  };

  const toggleScreen = () => {
    // console.log("👆 ToggleScreen chamado, showEnter atual:", showEnter);
    setShowEnter((prev) => !prev);
    progress.value = withTiming(showEnter ? 0 : 1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  };

  // --- Cálculos com fallback para garantir valores válidos ---
  const effectiveViewportHeight = viewportHeight || windowHeight;
  const effectiveImageHeight = imageHeight || initialImageHeight || windowHeight;

  const maxTranslateY =
    effectiveImageHeight > effectiveViewportHeight
      ? effectiveImageHeight - effectiveViewportHeight
      : 0;

  // --- Estilos animados ---
  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: effectiveViewportHeight,
    overflow: "hidden",
    width: viewportWidth || windowWidth,
  }));

  const animatedImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -maxTranslateY]);
    const compHeight = Math.max(effectiveImageHeight, effectiveViewportHeight);
    return {
      transform: [{ translateY }],
      position: "absolute",
      top: 0,
      left: 0,
      width: viewportWidth || windowWidth,
      height: compHeight,
    };
  });

  const animatedLogoStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [-100, -170]);
    return { transform: [{ translateY }] };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 0.5], [-60, 0]);
    const opacity = interpolate(progress.value, [0, 0.5], [1, 0]);
    return { transform: [{ translateY }], opacity };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.7, 1], [0, 1]);
    const translateY = interpolate(progress.value, [0, 1], [60, -270]);
    return { opacity, transform: [{ translateY }] };
  });

  // --- Loading screen ---
  const shouldShowLoading =
    authLoading ||
    loading ||
    imageHeight === null ||
    imageHeight === -1 ||
    viewportHeight === 0;

  if (shouldShowLoading) {
    let statusMessage = "Carregando...";
    if (authLoading) statusMessage = "Verificando autenticação...";
    else if (loading) statusMessage = "Navegando...";
    else if (imageHeight === -1) statusMessage = "Erro ao carregar dimensões da imagem.";
    else if (viewportHeight === 0) statusMessage = "Aguardando dimensões do layout...";
    else if (imageHeight === null) statusMessage = "Medindo dimensões...";

    // console.log("🔍 Loading state:", {
    //   authLoading,
    //   loading,
    //   imageHeight,
    //   viewportHeight,
    // });

    return (
      <View
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
        onLayout={onLayoutRootView}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>{statusMessage}</Text>
        <Text style={styles.debugText}>
          Debug: VH: {String(viewportHeight)}, VW: {String(viewportWidth)}, IH:{" "}
          {String(imageHeight)}
        </Text>
        <Text style={styles.debugText}>
          Auth: {String(authLoading)}, User: {String(!!user)}, Authenticated:{" "}
          {String(isAuthenticated)}
        </Text>
      </View>
    );
  }

  // console.log("🎨 Renderizando tela principal com animações");

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="dark" hidden={true} />
      <Animated.View style={animatedContainerStyle}>
        <Animated.Image
          source={longBackground}
          style={animatedImageStyle}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Animated.Image
            source={logoImage}
            style={[styles.logo, animatedLogoStyle]}
            resizeMode="contain"
          />
          {!showEnter && (
            <Animated.Text style={[styles.text, animatedTextStyle]}>
              CLIQUE PARA MERGULHAR
            </Animated.Text>
          )}
          <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
            {showEnter && (
              <TouchableOpacity onPress={handleNavigate} style={styles.button}>
                <Text style={styles.buttonText}>entrar</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Animated.View>

      {!showEnter && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={toggleScreen}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    minHeight: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logo: {
    width: windowWidth * 0.8,
    height: 150,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    color: "#5483c476",
    fontFamily: "TTMilksCasualPie",
  },
  buttonContainer: { position: "absolute", bottom: 80 },
  button: {
    backgroundColor: "#ff66c4",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "TTMilksCasualPie",
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase",
  },
  loadingText: { color: "#fff", fontSize: 18, marginTop: 20, textAlign: "center" },
  debugText: { color: "#fff", fontSize: 12, marginTop: 5, textAlign: "center" },
});
