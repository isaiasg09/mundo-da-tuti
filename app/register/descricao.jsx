import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BackButton from "@/components/backbutton";
import PinkButton from "@/components/pinkbutton";
import { useRegistration } from "@/context/RegistrationContext";

const { width } = Dimensions.get("window");

export default function Descricao() {
  const { registrationData, setRegistrationData } = useRegistration();
  const [descricao, setDescricao] = useState(registrationData.observacoes || "");

  const handleGoNext = () => {
    // Salva a descrição no contexto (pode ser vazia)
    setRegistrationData({ observacoes: descricao.trim() });

    // Navega para a próxima tela
    router.navigate("./customizarperfil");
  };

  const handleSkip = () => {
    // Limpa a descrição e vai para a próxima tela
    setRegistrationData({ observacoes: "" });
    router.navigate("./customizarperfil");
  };

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
          <Text style={styles.title}>DESCRIÇÃO PERSONALIZADA</Text>
          <Text style={styles.instruction}>
            Conte-nos mais sobre {registrationData.nome?.toUpperCase() || "A CRIANÇA"}{" "}
            (opcional):
          </Text>
          <Text style={styles.question}>
            Descreva características, gostos, dificuldades ou qualquer informação que
            possa ajudar a personalizar a experiência da criança.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Ex: Gosta muito de animais marinhos, tem dificuldade para se concentrar por muito tempo, prefere atividades visuais..."
            placeholderTextColor="rgba(72, 137, 157, 0.6)"
            value={descricao}
            onChangeText={setDescricao}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />

          <Text style={styles.characterCount}>{descricao.length}/500 caracteres</Text>
        </View>

        <View style={styles.buttonContainer}>
          <PinkButton
            title="PULAR"
            onPress={handleSkip}
            style={[styles.button, styles.skipButton]}
          />

          <PinkButton
            title="CONTINUAR"
            onPress={handleGoNext}
            style={[styles.button, styles.continueButton]}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    // justifyContent: "space-between"
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 30,
  },
  headerNavigation: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    marginBottom: 10,
  },
  header: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 24,
    color: "#1e3a8a",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginBottom: 15,
  },
  instruction: {
    fontSize: 18,
    color: "rgba(72, 137, 157, 0.81)",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginBottom: 10,
  },
  question: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    lineHeight: 22,
    textShadowColor: "#48899d",
    textShadowOffset: { height: 1.5 },
    textShadowRadius: 2,
    elevation: 3,
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    justifyContent: "center",
  },
  textArea: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    color: "#48899d",
    minHeight: 150,
    maxHeight: 400,
    borderWidth: 2,
    borderColor: "rgba(72, 137, 157, 0.3)",
  },
  characterCount: {
    fontSize: 12,
    color: "rgba(72, 137, 157, 0.7)",
    fontFamily: "TTMilksCasualPie",
    textAlign: "right",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
    flex: 0.2,
    alignItems: "flex-end",
  },
  button: {
    flex: 1,
    maxWidth: "50%",
    paddingHorizontal: 0,
  },
  skipButton: {
    backgroundColor: "rgba(72, 137, 157, 0.7)",
  },
  continueButton: {
    backgroundColor: "#ff4db8",
  },
});
