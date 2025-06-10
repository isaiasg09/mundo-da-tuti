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

export default function Pergunta2() {
  const { registrationData, setRegistrationData } = useRegistration(); // Usa o hook
  // Inicializa selectedOption com os valores do contexto, se houver
  // const [selectedButtons, setSelectedButtons] = useState(() => {
  //   // Converte os nomes das síndromes salvas de volta para índices
  //   return registrationData.sindromesCrianca
  //     .map((syndromeName) => options.indexOf(syndromeName))
  //     .filter((index) => index !== -1);
  // });

  const [selectedOption, setSelectedOption] = useState(() => {
    // Verifica se já existe uma opção selecionada no contexto
    const savedOption = registrationData.agitada;
    return savedOption !== undefined ? options.indexOf(savedOption) : null;
  });

  useEffect(() => {
    // Atualiza o contexto com a opção selecionada
    if (selectedOption !== null) {
      setRegistrationData({ agitada: options[selectedOption] });
    }
  }, [selectedOption]);

  // const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/bg_register.png")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerNavigation}>
          <BackButton title="Voltar" />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>SOBRE A CRIANÇA</Text>
          <Text style={styles.instruction}>MARQUE COM SIM OU NÃO:</Text>
          <Text style={styles.question}>O {"NOME"} É MUITO AGITADO?</Text>
        </View>

        <Image
          source={require("../../assets/images/poses_tuti/TutiAgitado.png")}
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
                router.navigate("./pergunta3");
              }
            }}
          >
            <Text style={styles.nextButtonText}>PRÓXIMO</Text>
          </TouchableOpacity>
        </View>

        <ProgressBar step={2} totalSteps={6} />
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
    // Para o botão Voltar
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
    marginTop: 30,
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
    marginTop: 15,
    // backgroundColor: "red",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    // gap: 10,
    paddingVertical: 15,
  },
  optionButton: {
    // width: "46%",
    // aspectRatio: 2 / 1,
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
