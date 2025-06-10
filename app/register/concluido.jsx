import React, { useRef, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
  Touchable,
  TouchableWithoutFeedback,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";
import PinkButton from "@/components/pinkbutton";
const { width: screenWidth } = Dimensions.get("window");

export default function Concluido() {
  const confettiRef = useRef(null); // Referência para o ConfettiCannon

  // Dispara os confetes automaticamente quando a tela carrega
  useEffect(() => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  // Nova função para disparar os confetes quando a imagem for clicada
  const fireConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start(); // Inicia a animação de confetes
    }
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
          Cadastro concluido
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "rgba(72, 137, 157, 0.81)",
            fontFamily: "TTMilksCasualPie",
            // marginTop: 20,
            textAlign: "center",
          }}
        >
          Bem vindo(a) ao mundo da tuti!
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
          title={"começar a aventura!"}
          onPress={() => router.navigate("/home")}
          style={{ marginTop: "10%", width: "100%" }}
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
