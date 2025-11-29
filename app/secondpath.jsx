import { useRegistration } from "@/context/RegistrationContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import BackButton from "../components/backbutton";
import ChestReward from "../components/chestreward";
import LevelNode from "../components/levelnode";
import SimpleNavBar from "../components/simplenavbar";
import { useGameProgress } from "../context/GameContext";
import { useLevelNavigation } from "../hooks/useLevelNavigation";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SecondPath() {
  // Parâmetros e contexto, se necessário
  const { pathId } = useLocalSearchParams();
  const { registrationData } = useRegistration();
  const effectivePathId = pathId || "molusco_perola";
  const { openLevel } = useLevelNavigation(effectivePathId);
  const { gameProgress } = useGameProgress();

  // imagens do fundo animado
  const starfish1 = require("../assets/images/estrela_mar.png");
  const starfish2 = require("../assets/images/estrela_mar.png");
  const seahorse1 = require("../assets/images/cavalo_marinho.png");
  const seahorse2 = require("../assets/images/cavalo_marinho.png");
  const jellyfish1 = require("../assets/images/agua_viva.png");
  const jellyfish2 = require("../assets/images/agua_viva.png");

  // --- CONFIGURAÇÃO CENTRAL DOS ELEMENTOS DE FUNDO ---
  const BG_ELEMENTS = [
    {
      key: "starfish1",
      source: starfish1,
      top: 0.08,
      left: 0.06,
      w: 90,
      h: 90,
      amp: 10,
      rotate: true,
      opacity: 0.28,
      phase: 0,
    },
    {
      key: "starfish2",
      source: starfish2,
      bottom: 0.16,
      left: 0.1,
      w: 65,
      h: 65,
      amp: 12,
      rotate: true,
      opacity: 0.22,
      phase: Math.PI / 3,
    },
    {
      key: "seahorse1",
      source: seahorse1,
      top: 0.26,
      right: 0.08,
      w: 85,
      h: 85,
      amp: 14,
      rotate: false,
      opacity: 0.3,
      phase: Math.PI / 1.5,
    },
    {
      key: "seahorse2",
      source: seahorse2,
      bottom: 0.4,
      left: 0.08,
      w: 55,
      h: 55,
      amp: 11,
      rotate: false,
      opacity: 0.25,
      phase: Math.PI / 2.2,
    },
    {
      key: "jellyfish1",
      source: jellyfish1,
      top: 0.35,
      left: 0.1,
      w: 95,
      h: 95,
      amp: 16,
      rotate: false,
      opacity: 0.35,
      phase: Math.PI / 4,
    },
    {
      key: "jellyfish2",
      source: jellyfish2,
      bottom: 0.35,
      right: 0.1,
      w: 80,
      h: 80,
      amp: 18,
      rotate: false,
      opacity: 0.28,
      phase: Math.PI / 1.1,
    },
  ];

  // Shared value global de progresso (0..1 em loop)
  const globalT = useSharedValue(0);

  // Gera estilos animados por elemento
  const animatedElementStyles = BG_ELEMENTS.reduce((acc, el) => {
    acc[el.key] = useAnimatedStyle(() => {
      const angle = (globalT.value * 2 * Math.PI + el.phase) % (2 * Math.PI);
      const translateY = Math.sin(angle) * el.amp;
      const translateX = Math.cos(angle) * el.amp * 0.15; // leve drift horizontal
      const rotateDeg = el.rotate ? Math.sin(angle) * 15 : 0;
      const scale = 1 + Math.sin(angle) * 0.04;
      return {
        transform: [
          { translateY },
          { translateX },
          el.rotate ? { rotate: `${rotateDeg}deg` } : { rotate: "0deg" },
          { scale },
        ],
        opacity: el.opacity + Math.sin(angle) * 0.08,
      };
    });

    return acc;
  }, {});

  // Posições lógicas das pérolas (nível 1 y: 0, nível 2 y: 80, ...)
  const logicalPearlPositions = [
    { x: 200, y: 75 }, // Nível 1 (base)
    { x: 300, y: 250 }, // Nível 2
    { x: 80, y: 300 }, // Nível 3
    { x: 250, y: 375 }, // Nível 4
    { x: 200, y: 550 }, // Nível 5
    { x: 200, y: 700 }, // Nível 6
    { x: 300, y: 850 }, // Nível 7
    { x: 150, y: 950 }, // Nível 8
  ];

  // Calcula a altura máxima lógica
  const logicalMaxY = Math.max(...logicalPearlPositions.map((p) => p.y));

  // Altura real do container
  const maxY = logicalMaxY + 200;

  // Inverte o eixo Y: nível 1 fica embaixo
  const pearlPositions = logicalPearlPositions.map((p) => ({
    x: p.x,
    y: maxY - p.y,
  }));

  const soundIcon = require("../assets/images/icons/sound_icon.png");
  const pearlImg = require("@/assets/images/perola.png");
  const pearlGlowImg = require("../assets/images/wm_s2.png");

  // Função de geração de caminho usando vetor perpendicular para curvas centradas
  // options: { startDir: 1|-1, baseAmp: number, ampScale: number, pivotInvertAfter?: number }
  const generatePath = (points, options = {}) => {
    const { startDir = 1, baseAmp = 55, ampScale = 0.5, pivotInvertAfter } = options;
    if (!points || points.length < 2) return "";
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.hypot(dx, dy) || 1;
      const perpX = -dy / dist;
      const perpY = dx / dist;
      let direction = (i % 2 === 1 ? 1 : -1) * startDir;
      if (pivotInvertAfter && i >= pivotInvertAfter) direction *= -1; // inverte depois do nível especificado
      const span = Math.abs(dy) + Math.abs(dx) * 0.4;
      let amp = baseAmp + span * ampScale;
      amp = Math.max(40, Math.min(amp, 110));
      if (Math.abs(dx) < 50) amp += 15;
      if (i === 1) amp *= 0.9;
      const midX = (p0.x + p1.x) / 2 + perpX * amp * direction;
      const midY = (p0.y + p1.y) / 2 + perpY * amp * direction;
      d += ` Q${midX},${midY} ${p1.x},${p1.y}`;
    }
    return d;
  };
  // const windowHeight = Dimensions.get("window").height;

  // Ref para o ScrollView
  const scrollRef = useRef(null);

  // Ao montar, rola para o final (base do caminho)
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollToEnd({ animated: false });
      }, 100);
    }

    const animate = () => {
      // Loop contínuo suave
      globalT.value = withRepeat(
        withTiming(1, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );
    };

    animate();
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradiente radial de fundo */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor="#d5b5ff" />
            <Stop offset="100%" stopColor="#d1adff" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgGrad)" />
      </Svg>

      {/* Topo fixo: voltar, baú e som */}
      <View style={styles.topButtonsContainer}>
        <BackButton onPress={() => router.push("/home")} />
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 9999999999,
            flex: "0 0 auto",
          }}
        >
          <Image
            source={soundIcon}
            style={{ width: 43, height: 35 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: maxY }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: maxY, width: "100%" }}>
          {/* Elementos animados */}
          <View style={styles.bgElementsLayer} pointerEvents="none">
            {BG_ELEMENTS.map((el) => {
              const stylePos = {
                position: "absolute",
                ...(el.top !== undefined ? { top: screenHeight * el.top } : {}),
                ...(el.bottom !== undefined ? { bottom: screenHeight * el.bottom } : {}),
                ...(el.left !== undefined ? { left: screenWidth * el.left } : {}),
                ...(el.right !== undefined ? { right: screenWidth * el.right } : {}),
                width: el.w,
                height: el.h,
              };
              return (
                <Animated.Image
                  key={el.key}
                  source={el.source}
                  style={[stylePos, animatedElementStyles[el.key]]}
                  resizeMode="contain"
                />
              );
            })}
          </View>

          {/* Caminho vindo de baixo até o nível 1 */}
          <Svg
            height={maxY}
            width="100%"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          >
            <Path
              d={
                pearlPositions.length > 0
                  ? generatePath(
                      [pearlPositions[0], { x: pearlPositions[0].x, y: maxY }],
                      {
                        startDir: 1,
                        baseAmp: 40,
                        ampScale: 0.35,
                      }
                    )
                  : ""
              } // lado ajustado para a DIREITA agora
              stroke="#d49b65"
              strokeWidth={5}
              strokeDasharray="10 8"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          {/* Caminho SVG principal */}
          <Svg
            height={maxY}
            width="100%"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          >
            <Path
              d={
                pearlPositions.length > 0
                  ? generatePath(pearlPositions, {
                      startDir: 1,
                      baseAmp: 60,
                      ampScale: 0.45,
                      pivotInvertAfter: 3,
                    })
                  : ""
              } // inverte direções a partir do nível 3
              stroke="#d49b65"
              strokeWidth={5}
              strokeDasharray="10 8"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          {/* Caminho do último nível até o baú */}
          <Svg
            height={maxY}
            width="100%"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          >
            <Path
              d={
                pearlPositions.length > 0
                  ? generatePath(
                      [
                        pearlPositions[pearlPositions.length - 1],
                        { x: screenWidth * 0.5, y: 60 }, // Posição do baú
                      ],
                      {
                        startDir: 1,
                        baseAmp: 60,
                        ampScale: 0.45,
                      }
                    )
                  : ""
              }
              stroke="#d49b65"
              strokeWidth={5}
              strokeDasharray="10 8"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          {/* Pérolas posicionadas */}
          {pearlPositions.map((pos, idx) => {
            const levelIndex = idx + 1;
            const statusObj =
              gameProgress.paths?.[effectivePathId]?.games?.[`game${levelIndex}`];
            const state = statusObj?.status || "locked";
            return (
              //   <View
              //   key={idx}
              //   style={[styles.pearlAbsolute, { left: pos.x - 30, top: pos.y - 30 }]}
              // >
              //   <Pressable
              //     onPress={() => console.log("Abrir nível", idx + 1)}
              //     // disabled={locked}
              //     hitSlop={8}
              //     // style={({ pressed }) => [
              //     //   styles.pearlButton,
              //     //   locked && styles.locked,
              //     //   pressed && { transform: [{ scale: 0.95 }] },
              //     // ]}
              //   >
              //     <Image
              //       source={pearlGlowImg}
              //       style={styles.pearlGlow}
              //       resizeMode="contain"
              //     />
              //     <Image source={pearlImg} style={styles.pearl} resizeMode="contain" />
              //     <Text style={styles.pearlLabel}>{idx + 1}</Text>
              //   </Pressable>
              // </View>

              <LevelNode
                key={idx}
                id={levelIndex}
                x={pos.x}
                y={pos.y}
                state={state}
                variant="pearl"
                glowImg={pearlGlowImg}
                mainImg={pearlImg}
                onPress={() => openLevel(levelIndex)}
              />
            );
          })}

          {/* Baú do tesouro no final do caminho */}
          <View
            style={{
              position: "absolute",
              top: 40, // Posição acima do último nível
              left: screenWidth * 0.5 - 30, // Centralizado
              zIndex: 15,
            }}
          >
            <ChestReward
              pathId="second"
              isVisible={true}
              onClose={() => {
                // Pode recarregar a tela ou fazer outras ações após fechar o modal
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Navbar fixa embaixo */}
      <SimpleNavBar style={{ backgroundColor: "#feb4e7", zIndex: 3 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d5b5ff", // fallback
  },
  topButtonsContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  bgElementsLayer: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
  },
  pearlAbsolute: {
    position: "absolute",
    zIndex: 1,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  pearl: {
    width: 60,
    height: 60,
  },
  pearlGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    top: -70,
    left: -70,
    opacity: 0.9,
  },
  pearlLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    lineHeight: 60, // centraliza verticalmente
    textAlign: "center", // centraliza horizontalmente
    fontFamily: "TTMilksCasualPie",
    fontSize: 24,
    color: "#f08faf",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  element: {
    position: "absolute",
  },
});
