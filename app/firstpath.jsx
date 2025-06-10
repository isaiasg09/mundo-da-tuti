// App.js
import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";

import { useLocalSearchParams } from "expo-router"; // Importe este hook para receber parâmetros

import SimpleNavBar from "@/components/simplenavbar";
import BackButton from "@/components/backbutton";
import ShellPathMap from "@/components/shellpathmap";
import AnimatedBackground from "@/components/animatedbackgroundpath";

export default function FirstPath() {
  // const personIcon = require("../assets/images/icons/person_icon.png");
  // const houseIcon = require("../assets/images/icons/house_icon.png");
  // const cfgIcon = require("../assets/images/icons/cfg_icon.png");
  const arrowIcon = require("../assets/images/icons/arrow_icon.png");
  const treasureImg = require("../assets/images/treasure.png");
  const soundIcon = require("../assets/images/icons/sound_icon.png");

  // Recebe os parâmetros passados pela rota (neste caso, o pathId vindo da tela Home)
  const { pathId } = useLocalSearchParams();
  
  console.log("TELA FirstPath: pathId recebido da rota é:", pathId);

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.topButtonsContainer}>
        <BackButton
          style={{
            flex: "0 0 auto",
          }}
        />

        <Image source={treasureImg} style={styles.rewardImg} />

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
      <View style={styles.navBarContainer}>
        <SimpleNavBar />
      </View>
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
  navBarContainer: {
    backgroundColor: "#feb4e7",
    width: "100%",
    // padding: 1,
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
