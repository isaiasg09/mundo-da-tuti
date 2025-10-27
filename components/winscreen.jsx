import { logger } from "@/utils/logger";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function WinScreen({
  pathId,
  gameId,
  openMap,
  openNext,
  completeLevel,
  message = "🎉 VOCÊ GANHOU! 🎉",
  subtitle = "Parabéns!",
  onContinue,
  onBackToMap,
  showContinue = true,
  customMessage,
  visible = true,
  isLoading = false, // Novo prop para loading state
}) {
  // Usar uma key única para forçar recriação do componente confetti a cada vitória
  const [componentKey, setComponentKey] = useState(Date.now());
  const confettiRef = useRef(null);
  const [confettiStarted, setConfettiStarted] = useState(false);
  const animationTimeoutRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  const cleanupResources = useCallback(() => {
    // Parar confetti imediatamente
    if (confettiRef.current) {
      confettiRef.current.stop();
    }

    // Limpar todos os timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    setConfettiStarted(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      cleanupResources();
      return;
    }

    // Gerar nova key para forçar recriação do confetti
    setComponentKey(Date.now());

    // Iniciar confetti apenas uma vez
    if (!confettiStarted) {
      animationTimeoutRef.current = setTimeout(() => {
        if (confettiRef.current && !confettiStarted) {
          confettiRef.current.start();
          setConfettiStarted(true);

          // Parar automaticamente após 2 segundos
          stopTimeoutRef.current = setTimeout(() => {
            if (confettiRef.current) {
              confettiRef.current.stop();
            }
          }, 2000);
        }
      }, 100);
    }

    // Cleanup function
    return cleanupResources;
  }, [visible, confettiStarted, cleanupResources]);

  if (!visible) return null;

  // Usar as props novas se fornecidas, senão usar as antigas para compatibilidade
  const handleContinue = useCallback(() => {
    // Limpar todos os recursos antes de navegar
    cleanupResources();

    // Usar openNext do hook para navegar corretamente
    if (openNext && gameId) {
      try {
        openNext(gameId);
      } catch (e) {
        logger.error('Erro ao navegar para próximo nível:', e);
        if (openMap) {
          openMap();
        }
      }
    } else if (onContinue) {
      onContinue();
    } else if (openMap) {
      // Se não há próximo nível, volta ao mapa
      openMap();
    }
  }, [cleanupResources, openNext, gameId, onContinue, openMap]);

  const handleBackToMap = useCallback(() => {
    // Limpar todos os recursos antes de navegar
    cleanupResources();

    if (openMap) {
      openMap();
    } else if (onBackToMap) {
      onBackToMap();
    }
  }, [cleanupResources, openMap, onBackToMap]);
  const displayMessage = message || customMessage;

  return (
    <View style={styles.winContainer}>
      {/* <ConfettiCannon
        key={componentKey} // Força recriação do componente
        ref={confettiRef}
        count={100} // Reduzido ainda mais para melhor performance
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={4000} // Acelera ainda mais a queda
        explosionSpeed={300} // Reduz velocidade da explosão
        colors={["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7"]} // Cores fixas para evitar cálculos
      /> */}

      <Text style={styles.winTitle}>{displayMessage}</Text>

      <TouchableWithoutFeedback onPress={() => confettiRef.current?.start()}>
        <Image
          source={require("../assets/images/tuti_festa.png")}
          style={styles.tutiImage}
          resizeMode="contain"
        />
      </TouchableWithoutFeedback>

      {subtitle && <Text style={styles.winSubtitle}>{subtitle}</Text>}

      <View style={styles.buttonContainer}>
        {showContinue && (openNext || onContinue) && (
          <TouchableOpacity
            style={[styles.continueButton, isLoading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "SALVANDO..." : "PRÓXIMO NÍVEL"}
            </Text>
          </TouchableOpacity>
        )}

        {handleBackToMap && (
          <TouchableOpacity
            style={[styles.mapButton, isLoading && styles.buttonDisabled]}
            onPress={handleBackToMap}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: "#9d59ff" }]}>
              VOLTAR AO CAMINHO
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  winContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#62bfec", // Fundo azul como na tela original
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 20,
  },
  winTitle: {
    fontSize: 36,
    fontFamily: "TTMilksCasualPie",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  tutiImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  winSubtitle: {
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  continueButton: {
    backgroundColor: "#ff4da6", // Rosa como na tela original
    paddingVertical: 15,
    borderRadius: 30,
    width: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapButton: {
    backgroundColor: "transparent",
    borderColor: "#9d59ff",
    borderWidth: 2,
    paddingVertical: 15,
    borderRadius: 30,
    width: "70%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
    color: "#fff",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: "#cccccc",
  },
});
