import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useGameProgress } from "../context/GameContext";

const { width: windowWidth, height: windowHeight } = Dimensions.get("screen");

const ChestReward = ({ pathId, isVisible, onClose }) => {
  const { isPathCompleted, unlockNextPathViaChest, gameProgress } = useGameProgress();
  const [showModal, setShowModal] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);

  // Animações do baú
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const lockScale = useSharedValue(1);

  useEffect(() => {
    if (isVisible && isPathCompleted(pathId)) {
      // Animação de brilho do baú
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    } else if (isVisible && !isPathCompleted(pathId)) {
      // Animação sutil do cadeado para chamar atenção
      lockScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isVisible, pathId]);

  const handleChestPress = () => {
    if (!isPathCompleted(pathId)) return;

    // Animação de clique
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 200 }),
      withTiming(1, { duration: 100 })
    );

    // Abrir baú e desbloquear próximo caminho
    setChestOpened(true);
    const unlocked = unlockNextPathViaChest(pathId);

    if (unlocked) {
      setShowModal(true);
    }
  };

  const animatedChestStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedLockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lockScale.value }],
  }));

  const getPathName = (pathId) => {
    switch (pathId) {
      case "first":
        return "Primeiro Caminho";
      case "second":
        return "Segundo Caminho";
      case "third":
        return "Terceiro Caminho";
      default:
        return "Caminho";
    }
  };

  const getNextPathName = (pathId) => {
    switch (pathId) {
      case "first":
        return "Segundo Caminho desbloqueado!";
      case "second":
        return "Terceiro Caminho desbloqueado!";
      case "third":
        return "Todos os caminhos completos!";
      default:
        return "Próximo caminho desbloqueado!";
    }
  };

  // Verificar se o baú já foi aberto (próximo caminho desbloqueado)
  const hasBeenOpened = () => {
    const pathMapping = {
      first: "molusco_perola", // próximo caminho após o primeiro
      second: "anemona", // próximo caminho após o segundo
      third: null, // terceiro é o último
    };

    const nextPathId = pathMapping[pathId];
    if (!nextPathId) return false; // terceiro caminho não tem próximo

    const nextPathStatus = gameProgress.paths?.[nextPathId]?.status;
    return nextPathStatus === "unlocked" || nextPathStatus === "completed";
  };

  if (!isVisible) return null;

  const canOpenChest = isPathCompleted(pathId);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleChestPress}
        disabled={!canOpenChest}
        style={styles.chestButton}
      >
        <Animated.View style={animatedChestStyle}>
          {/* Brilho do baú quando disponível */}
          {canOpenChest && (
            <Animated.Image
              source={require("../assets/images/brilho.png")}
              style={[styles.glowImage, animatedGlowStyle]}
              resizeMode="contain"
            />
          )}

          {/* Imagem do baú */}
          <View style={styles.chestContainer}>
            {hasBeenOpened() ? (
              <Image
                source={require("../assets/images/treasure.png")}
                style={styles.chestImage}
              />
            ) : (
              <Image
                source={require("../assets/images/closed_treasure.png")}
                style={styles.chestImage}
              />
            )}

            {/* Cadeado quando o baú não pode ser aberto */}
            {!canOpenChest && (
              <Animated.View style={[styles.lockContainer, animatedLockStyle]}>
                <Image
                  source={require("../assets/images/cadeado.webp")}
                  style={styles.lockImage}
                />
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Modal de recompensa */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        presentationStyle="overFullScreen"
        hardwareAccelerated={true}
        onRequestClose={() => {
          setShowModal(false);
          onClose && onClose();
        }}
      >
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Parabéns! 🎉</Text>
            <Text style={styles.modalMessage}>
              Você completou o {getPathName(pathId)}!
            </Text>
            <Text style={styles.modalReward}>{getNextPathName(pathId)}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowModal(false);
                onClose && onClose();
              }}
            >
              <Text style={styles.closeButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  chestButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  chestContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  lockContainer: {
    position: "absolute",
    top: "25%",
    left: "30%",
    // transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  lockImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  chestEmoji: {
    fontSize: 32,
  },
  chestImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  glowImage: {
    position: "absolute",
    width: 150,
    height: 150,
    top: -25,
    left: -25,
    zIndex: -1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -50, // Garante que cubra área superior
    left: 0,
    right: 0,
    bottom: -50, // Garante que cubra área inferior
    width: windowWidth,
    height: windowHeight + 100, // Adiciona altura extra
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    color: "#2E86AB",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "TTMilksCasualPie",
  },
  modalMessage: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    fontFamily: "TTMilksCasualPie",
    marginBottom: 10,
  },
  modalReward: {
    fontSize: 16,
    color: "#FF6B6B",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginBottom: 25,
  },
  closeButton: {
    backgroundColor: "#2E86AB",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    // fontWeight: "bold",
  },
});

export default ChestReward;
