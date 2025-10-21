import React, { useCallback } from "react";
import { BackHandler, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"; // Importe este hook para receber parâmetros

import AnimatedBackground from "@/components/animatedbackgroundpath";
import BackButton from "@/components/backbutton";
import ChestReward from "@/components/chestreward";
import ShellPathMap from "@/components/shellpathmap";
import SimpleNavBar from "@/components/simplenavbar";

export default function FirstPath() {
  const arrowIcon = require("../assets/images/icons/arrow_icon.png");
  const treasureImg = require("../assets/images/treasure.png");
  const soundIcon = require("../assets/images/icons/sound_icon.png");

  // Recebe os parâmetros passados pela rota (neste caso, o pathId vindo da tela Home)
  const { pathId: incoming } = useLocalSearchParams();
  const pathId = incoming || "castelo";
  const router = useRouter();

  // Intercepta o botão físico de voltar do Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Vai para a tela home ao invés de voltar por onde veio
        router.replace("/home");
        return true; // Previne o comportamento padrão
      };

      // Adiciona o listener para o botão de voltar
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      // Remove o listener quando a tela perde o foco
      return () => subscription?.remove();
    }, [router])
  );

  console.log("TELA FirstPath: pathId recebido da rota é:", pathId);

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.topButtonsContainer}>
        <BackButton
          onPress={() => router.replace("/home")}
          style={{
            flex: "0 0 auto",
          }}
        />

        <ChestReward
          pathId="first"
          isVisible={true}
          onClose={() => {
            // Pode recarregar a tela ou fazer outras ações após fechar o modal
          }}
        />

        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 9999999999,
            flex: "0 0 auto",
          }}
        >
          <Image
            source={soundIcon}
            style={{ width: 43, height: 35 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <ShellPathMap pathId={pathId} />

      {/* <ScrollView></ScrollView> */}
      {/* <View style={styles.navBarContainer}> */}
      <SimpleNavBar style={{ backgroundColor: "#feb4e7" }} />

      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#ffe8ac",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    padding: 10,
    paddingBottom: 0,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // flexDirection: "row",
  },
  rewardImg: {
    width: 120,
    height: 110,
    flex: "0 0 auto",
    marginTop: 10,
    // borderRadius: 50,
    // marginRight: 10,
  },
});
