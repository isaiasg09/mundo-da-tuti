import React, { useEffect, useRef } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

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
}) {
  const confettiRef = useRef(null);

  useEffect(() => {
    // Disparar confete após um pequeno delay para garantir que o componente foi montado
    const timer = setTimeout(() => {
      if (confettiRef.current) {
        confettiRef.current.start();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  // Usar as props novas se fornecidas, senão usar as antigas para compatibilidade
  const handleContinue = () => {
    // Usar apenas openNext para navegar, pois o nível já foi marcado como completo quando ganhou
    if (openNext && gameId) {
      try {
        openNext(Number(gameId));
      } catch (e) {
        console.log("Erro ao abrir próximo nível:", e);
        if (openMap) openMap();
      }
    } else if (onContinue) {
      onContinue();
    } else if (openMap) {
      // Se não há próximo nível, volta ao mapa
      openMap();
    }
  };

  const handleBackToMap = openMap || onBackToMap;
  const displayMessage = message || customMessage;

  return (
    <View style={styles.winContainer}>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
      />

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
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.buttonText}>PRÓXIMO NÍVEL</Text>
          </TouchableOpacity>
        )}

        {handleBackToMap && (
          <TouchableOpacity style={styles.mapButton} onPress={handleBackToMap}>
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
});
