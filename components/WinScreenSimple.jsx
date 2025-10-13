import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function WinScreenSimple({
  pathId,
  gameId,
  openMap,
  openNext,
  message = "🎉 VOCÊ GANHOU! 🎉",
  subtitle = "Parabéns!",
}) {
  const confettiRef = useRef(null);

  useEffect(() => {
    // Disparar confete após um pequeno delay
    const timer = setTimeout(() => {
      if (confettiRef.current) {
        confettiRef.current.start();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.winContainer}>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
      />

      <View style={styles.winContent}>
        <Text style={styles.winText}>{message}</Text>
        {subtitle && <Text style={styles.winSubtitle}>{subtitle}</Text>}

        <View style={styles.buttonContainer}>
          {openNext && (
            <TouchableOpacity style={styles.continueButton} onPress={openNext}>
              <Text style={styles.buttonText}>PRÓXIMO NÍVEL</Text>
            </TouchableOpacity>
          )}

          {openMap && (
            <TouchableOpacity style={styles.mapButton} onPress={openMap}>
              <Text style={styles.buttonText}>VOLTAR AO CAMINHO</Text>
            </TouchableOpacity>
          )}
        </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  winContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  winText: {
    fontSize: 28,
    fontFamily: "TTMilksCasualPie",
    color: "#27AE60",
    textAlign: "center",
    marginBottom: 15,
  },
  winSubtitle: {
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
    color: "#34495E",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
    width: "100%",
  },
  continueButton: {
    backgroundColor: "#27AE60",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});
