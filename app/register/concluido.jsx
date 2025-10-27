import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import BackButton from "@/components/backbutton";
import PinkButton from "@/components/pinkbutton";
import { useGameProgress } from "@/context/GameContext";
import { useRegistration } from "@/context/RegistrationContext";
import { logger } from "../../utils/logger";

const { width: screenWidth } = Dimensions.get("window");

// Validação simples dos dados de cadastro
const validateRegistrationData = (data) => {
  const missing = [];
  const messages = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.email || !emailRegex.test(String(data.email).trim())) {
    missing.push("email");
    messages.push("Email inválido ou ausente.");
  }
  if (!data.senha || String(data.senha).length < 5) {
    missing.push("senha");
    messages.push("Senha deve ter pelo menos 5 caracteres.");
  }
  if (!data.codigoSeguranca || String(data.codigoSeguranca).trim().length < 4) {
    missing.push("código de segurança");
    messages.push("Código de segurança deve ter 4 dígitos.");
  }
  if (!data.nome || String(data.nome).trim().length === 0) {
    missing.push("nome da criança");
    messages.push("Informe o nome da criança.");
  }
  if (!data.idade || isNaN(parseInt(data.idade))) {
    missing.push("idade");
    messages.push("Informe a idade da criança.");
  }

  return {
    ok: missing.length === 0,
    missing,
    message: messages.join("\n"),
  };
};

export default function Concluido() {
  const confettiRef = useRef(null); // Referência para o ConfettiCannon
  const { submitRegistration, isLoading, error, registrationData } = useRegistration();
  const { setActiveChild } = useGameProgress();
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Dispara os confetes automaticamente quando a tela carrega
  useEffect(() => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }

    // Registrar automaticamente quando a tela carregar
    handleRegistration();
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  // Nova função para disparar os confetes quando a imagem for clicada
  const fireConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start(); // Inicia a animação de confetes
    }
  };

  // Função para registrar no Firebase
  const handleRegistration = async () => {
    if (registrationCompleted) return; // Evita registro duplicado

    try {
      // console.log("Iniciando registro no Firebase com dados:", registrationData);

      // Validação antes de enviar
      const v = validateRegistrationData(registrationData || {});
      if (!v.ok) {
        Alert.alert(
          "Dados incompletos",
          v.message || "Preencha todos os campos obrigatórios do cadastro.",
          [{ text: "OK" }]
        );
        return; // Não tenta registrar com dados inválidos
      }

      const result = await submitRegistration();

      if (result && result.success) {
        // Seleciona imediatamente a criança criada como ativa
        if (result.childId) {
          setActiveChild(result.childId);
        }
        // console.log("Registro concluído com sucesso! Guardian ID:", result.guardianId);
        setRegistrationCompleted(true);
        // Disparar confetes adicionais quando o registro for bem-sucedido
        setTimeout(() => {
          if (confettiRef.current) {
            confettiRef.current.start();
          }
        }, 1000);
      } else {
        const errMsg = result?.error || error || "Não foi possível concluir o cadastro.";
        logger.error("Erro no registro:", errMsg);
        Alert.alert(
          "Erro no Cadastro",
          `Não foi possível concluir o cadastro: ${errMsg}`,
          [
            {
              text: "Tentar Novamente",
              onPress: () => setRegistrationCompleted(false),
            },
            {
              text: "Voltar",
              onPress: () => router.back(),
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      logger.error("Erro inesperado no registro:", error);
      Alert.alert("Erro Inesperado", "Ocorreu um erro inesperado. Tente novamente.", [
        {
          text: "Tentar Novamente",
          onPress: () => setRegistrationCompleted(false),
        },
        {
          text: "Voltar",
          onPress: () => router.back(),
          style: "cancel",
        },
      ]);
    }
  };

  // Função para começar a aventura
  const handleStartAdventure = () => {
    if (!registrationCompleted && !isLoading) {
      Alert.alert(
        "Cadastro em Andamento",
        "Aguarde a conclusão do cadastro antes de continuar.",
        [{ text: "OK" }]
      );
      return;
    }

    router.navigate("/home");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/bg_gradient.png")}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1, // Permite que o conteúdo cresça e o scroll funcione se necessário
          alignItems: "center", // Centraliza o conteúdo horizontalmente
          // justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 26, // Espaço no topo dentro do scroll
          paddingBottom: 30, // Espaço na base dentro do scroll
          gap: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <BackButton />
        </View>

        <Text
          style={{
            fontFamily: "TTMilksCasualPie",
            color: "#9d59ff",
            textTransform: "uppercase",
            fontSize: 28,
            textAlign: "center",
          }}
        >
          {isLoading ? "Finalizando cadastro..." : "Cadastro concluído"}
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "rgba(72, 137, 157, 0.81)",
            fontFamily: "TTMilksCasualPie",
            textAlign: "center",
          }}
        >
          {isLoading
            ? "Aguarde, estamos criando sua conta..."
            : registrationCompleted
              ? "Bem vindo(a) ao mundo da tuti!"
              : "Finalizando seu cadastro..."}
        </Text>

        <TouchableWithoutFeedback onPress={fireConfetti}>
          <Image
            source={require("@/assets/images/poses_tuti/tuti_comemorando.png")}
            style={{
              width: "100%",
              height: "50%",
              resizeMode: "contain",
              // backgroundColor: "red",
              transform: [{ rotate: "10deg" }], // Inverte horizontalmente
            }}
          />
        </TouchableWithoutFeedback>

        <PinkButton
          title={isLoading ? "Criando conta..." : "começar a aventura!"}
          onPress={handleStartAdventure}
          style={{
            marginTop: "10%",
            width: "100%",
            opacity: isLoading || !registrationCompleted ? 0.6 : 1,
          }}
          disabled={isLoading || !registrationCompleted}
        />

        {/* Canhão de Confetes! */}
        <ConfettiCannon
          ref={confettiRef} // Referência para o canhão de confetes
          count={200} // Quantidade de confetes
          origin={{ x: screenWidth / 2, y: -20 }} // Ponto de origem da "explosão" (centro superior da tela)
          autoStart={false} // Inicia automaticamente quando o componente monta
          fadeOut={true} // Faz os confetes desaparecerem suavemente
          explosionSpeed={350} // Velocidade inicial da explosão
          fallSpeed={3000} // Velocidade da queda
          // colors={['#ff69b4', '#1e90ff', '#32cd32', '#ffd700']} // Cores customizadas (opcional)
        />
      </ScrollView>
    </ImageBackground>
  );
}
