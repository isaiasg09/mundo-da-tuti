import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
} from "react-native";

import { router } from "expo-router";
import BackButton from "@/components/backbutton";
import ProgressBar from "@/components/progressbar";
import { useRegistration } from "../../context/RegistrationContext";

const options = ["SIM", "NÃO"];

export default function Pergunta3() {
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook
  const [selectedOption, setSelectedOption] = useState(() => {
    // Verifica se já existe uma opção selecionada no contexto
    const savedOption = registrationData.dificuldadeInstrucoes;
    return savedOption !== undefined ? options.indexOf(savedOption) : null;
  });

  useEffect(() => {
    // Atualiza o contexto com a opção selecionada
    if (selectedOption !== null) {
      setRegistrationData({ dificuldadeInstrucoes: options[selectedOption] });
    }
  }, [selectedOption]);

  // const toggleButtonSelection = (index) => {
  //   const isNenhuma = options[index] === "NENHUMA";

  //   if (isNenhuma) {
  //     setSelectedButtons((prev) => (prev.includes(index) ? [] : [index]));
  //   } else {
  //     setSelectedButtons((prev) => {
  //       const hasNenhuma = prev.includes(options.indexOf("NENHUMA"));
  //       if (hasNenhuma) return [index];
  //       return prev.includes(index)
  //         ? prev.filter((i) => i !== index)
  //         : [...prev, index];
  //     });
  //   }
  // };

  return (
    <ImageBackground
      source={require("@/assets/images/bg_register.png")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={true}>
        {/* Botão de Voltar */}
        <View style={styles.headerNavigation}>
          <BackButton title="Voltar" />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>SOBRE A CRIANÇA</Text>
          <Text style={styles.instruction}>MARQUE COM SIM OU NÃO:</Text>
          <Text style={styles.question}>
            O NOME TEM DIFICULDADES EM SEGUIR INSTRUÇÕES?
          </Text>

          <Image
            source={require("@/assets/images/poses_tuti/TutiConfusa.png")}
            style={styles.birraImage}
          />
        </View>

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
                style={[
                  styles.optionText,
                  selectedOption === index && { color: "#fff" },
                ]}
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
                router.navigate("./pergunta4");
              }
            }}
          >
            <Text style={styles.nextButtonText}>PRÓXIMO</Text>
          </TouchableOpacity>
        </View>

        <ProgressBar step={3} totalSteps={6} />
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
