import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function AnimatedBackgroundPath() {
  // Carregue suas imagens dos elementos do mar
  const coral1 = require("../assets/images/coral1.png");
  const coral2 = require("../assets/images/coral2.png"); // Usando a mesma imagem para exemplo
  const coral3 = require("../assets/images/coral3.png"); // Usando a mesma imagem para exemplo
  const starfish1 = require("../assets/images/estrela1.png");
  const starfish2 = require("../assets/images/estrela2.png"); // Usando a mesma imagem para exemplo
  const crab1 = require("../assets/images/caranguejo.png");
  const crab2 = require("../assets/images/caranguejo.png"); // Usando a mesma imagem para exemplo

  // Valores compartilhados para animação (apenas movimento vertical suave)
  const coral1Y = useSharedValue(Math.random() * 40 - 20);
  const coral2Y = useSharedValue(Math.random() * 40 - 20);
  const coral3Y = useSharedValue(Math.random() * 40 - 20);
  const starfish1Y = useSharedValue(Math.random() * 30 - 15);
  const starfish2Y = useSharedValue(Math.random() * 30 - 15);
  const crab1X = useSharedValue(Math.random() * 20 - 10);
  const crab2X = useSharedValue(Math.random() * 20 - 10);

  // Estilos animados
  const animatedCoral1 = useAnimatedStyle(() => ({
    transform: [{ translateY: coral1Y.value }],
  }));
  const animatedCoral2 = useAnimatedStyle(() => ({
    transform: [{ translateY: coral2Y.value }],
  }));
  const animatedCoral3 = useAnimatedStyle(() => ({
    transform: [{ translateY: coral3Y.value }],
  }));
  const animatedStarfish1 = useAnimatedStyle(() => ({
    transform: [{ translateY: starfish1Y.value }],
  }));
  const animatedStarfish2 = useAnimatedStyle(() => ({
    transform: [{ translateY: starfish2Y.value }],
  }));
  const animatedCrab1 = useAnimatedStyle(() => ({
    transform: [{ translateX: crab1X.value }],
  }));
  const animatedCrab2 = useAnimatedStyle(() => ({
    transform: [{ translateX: crab2X.value }, { rotate: "90deg" }],
  }));

  useEffect(() => {
    const animate = () => {
      coral1Y.value = withTiming(Math.random() * 40 - 20, {
        duration: 4000,
        easing: Easing.inOut(Easing.quad),
      });
      coral2Y.value = withTiming(Math.random() * 40 - 20, {
        duration: 5000,
        easing: Easing.inOut(Easing.quad),
      });
      coral3Y.value = withTiming(Math.random() * 40 - 20, {
        duration: 6000,
        easing: Easing.inOut(Easing.quad),
      });
      starfish1Y.value = withTiming(Math.random() * 30 - 15, {
        duration: 4500,
        easing: Easing.inOut(Easing.quad),
      });
      starfish2Y.value = withTiming(Math.random() * 30 - 15, {
        duration: 5500,
        easing: Easing.inOut(Easing.quad),
      });
      crab1X.value = withTiming(Math.random() * 20 - 10, {
        duration: 5000,
        easing: Easing.linear,
      });
      crab2X.value = withTiming(Math.random() * 20 - 10, {
        duration: 6000,
        easing: Easing.linear,
      });

      // Reinicia a animação após um tempo aleatório
      setTimeout(animate, 3000 + Math.random() * 5000);
    };

    animate();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={coral1}
        style={[styles.element, styles.coral1Style, animatedCoral1]}
        resizeMode="contain"
      />
      <Animated.Image
        source={coral2}
        style={[styles.element, styles.coral2Style, animatedCoral2]}
        resizeMode="contain"
      />
      <Animated.Image
        source={coral3}
        style={[styles.element, styles.coral3Style, animatedCoral3]}
        resizeMode="contain"
      />
      <Animated.Image
        source={starfish1}
        style={[styles.element, styles.starfish1Style, animatedStarfish1]}
        resizeMode="contain"
      />
      <Animated.Image
        source={starfish2}
        style={[styles.element, styles.starfish2Style, animatedStarfish2]}
        resizeMode="contain"
      />
      <Animated.Image
        source={crab1}
        style={[styles.element, styles.crab1Style, animatedCrab1]}
        resizeMode="contain"
      />
      <Animated.Image
        source={crab2}
        style={[styles.element, styles.crab2Style, animatedCrab2]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffe8ac",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  element: {
    position: "absolute",
  },
  coral1Style: {
    width: 90,
    height: 90,
    top: screenHeight * 0.2,
    left: screenWidth * 0.05,
  },
  coral2Style: {
    width: 50,
    height: 50,
    bottom: screenHeight * 0.45,
    left: screenWidth * 0.1,
  },
  coral3Style: {
    width: 70,
    height: 70,
    bottom: screenHeight * 0.3,
    right: screenWidth * 0.1,
  },
  starfish1Style: {
    width: 35,
    height: 35,
    top: screenHeight * 0.36,
    right: screenWidth * 0.02,
  },
  starfish2Style: {
    width: 40,
    height: 40,
    bottom: screenHeight * 0.23,
    right: screenWidth * 0.2,
  },
  crab1Style: {
    width: 65,
    height: 65,
    top: screenHeight * 0.25,
    left: screenWidth * 0.8,
  },
  crab2Style: {
    width: 65,
    height: 65,
    bottom: screenHeight * 0.16,
    left: screenWidth * 0.02,
    transform: "rotate(45deg)",
  },
});
