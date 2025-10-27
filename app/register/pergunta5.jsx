import BackButton from "@/components/backbutton";
import ProgressBar from "@/components/progressbar";
import { useRegistration } from "@/context/RegistrationContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const options = ["SIM", "NÃO"];

export default function Pergunta5() {
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook
  const [selectedOption, setSelectedOption] = useState(() => {
    const saved = registrationData.seDistraiFacilmente;
    const idx = options.indexOf(saved);
    return idx !== -1 ? idx : null;
  });

  useEffect(() => {
    if (selectedOption !== null) {
      setRegistrationData({ seDistraiFacilmente: options[selectedOption] });
    }
  }, [selectedOption]);

  return (
    <ImageBackground
      source={require("@/assets/images/bg_register.png")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Botão de Voltar */}
        <View style={styles.headerNavigation}>
          <BackButton title="Voltar" />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>SOBRE A CRIANÇA</Text>
          <Text style={styles.instruction}>MARQUE COM SIM OU NÃO:</Text>
          <Text style={styles.question}>O NOME SE DISTRAI COM FACILIDADE?</Text>
        </View>

        {/* Imagem da tartaruga - fora do header */}
        <Image
          source={require("@/assets/images/poses_tuti/tuti_distraida.png")}
          style={styles.birraImage}
        />

        <View style={styles.buttonContainer}>
          {options.map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && styles.buttonSelected,
              ]}
              onPress={() => setSelectedOption(index)}
            >
              <Text
                style={[styles.optionText, selectedOption === index && { color: "#fff" }]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              // Botão só é opaco e clicável se alguma opção for selecionada
              { opacity: selectedOption !== null ? 1 : 0.5 },
            ]}
            // Desabilita se nada selecionado
            disabled={selectedOption === null}
            onPress={() => {
              if (selectedOption !== null) {
                router.navigate("./pergunta6");
              }
            }}
          >
            <Text style={styles.nextButtonText}>PRÓXIMO</Text>
          </TouchableOpacity>
        </View>
        <ProgressBar step={5} totalSteps={6} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flexGrow: 1, // Permite que o conteúdo cresça e o scroll funcione se necessário
    alignItems: "center", // Centraliza o conteúdo horizontalmente
    justifyContent: "space-between", // Distribui o espaço entre header, opções e bottom
    paddingHorizontal: 24,
    paddingTop: 26, // Espaço no topo dentro do scroll
    paddingBottom: 30, // Espaço na base dentro do scroll
  },
  headerNavigation: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    marginBottom: 10, // Espaço abaixo do botão voltar
  },
  header: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 32,
    color: "#1e3a8a",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
  },
  instruction: {
    fontSize: 20,
    color: "rgba(72, 137, 157, 0.81)",
    fontFamily: "TTMilksCasualPie",
    marginTop: 20,
    textAlign: "center",
  },
  question: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "TTMilksCasualPie",
    marginTop: 25,
    textAlign: "center",
    textShadowColor: "#48899d",
    textShadowOffset: { height: 1.5 },
    textShadowRadius: 2,
    elevation: 3,
  },
  birraImage: {
    height: 300,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    // gap: 10,
    paddingVertical: 15,
  },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: "12%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSelected: {
    backgroundColor: "rgba(255, 131, 207, 0.7)",
  },
  optionText: {
    color: "#3b5db6",
    fontSize: 30,
    fontFamily: "TTMilksCasualPie",
  },
  bottomContainer: {
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#ff4db8",
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 9999,
  },
  nextButtonText: {
    color: "white",
    fontSize: 24,
    fontFamily: "TTMilksCasualPie",
  },
});
