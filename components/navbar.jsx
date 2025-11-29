import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function NavBar() {
  const personIcon = require("../assets/images/icons/person_icon.png");
  const gameIcon = require("../assets/images/icons/game_icon.png");
  const cfgIcon = require("../assets/images/icons/cfg_icon.png");
  const burgerIcon = require("../assets/images/icons/burger_icon.png");

  const router = useRouter();

  return (
    <View style={styles.topNav}>
      {/* Botão de Perfil */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/perfil")}>
        <Image source={personIcon} style={styles.navButtonIcon} resizeMode="cover" />
      </TouchableOpacity>
      {/*  Botão de Jogo: A SER IMPLEMENTADO */}
      {/* <TouchableOpacity
        style={styles.navButton}
        // onPress={() => router.push("/home")}
      >
        <Image source={gameIcon} style={styles.navButtonIcon} resizeMode="contain" />
      </TouchableOpacity> */}
      {/* BBotão de Configurações */}
      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/settings")}>
        <Image source={cfgIcon} style={styles.navButtonIcon} resizeMode="cover" />
      </TouchableOpacity>

      {/* Botão de Menu: A SER IMPLEMENTADO */}
      {/* <TouchableOpacity
        style={styles.navButton}
        // onPress={() => router.push("/settings")}
      >
        <Image source={burgerIcon} style={styles.navButtonIcon} resizeMode="contain" />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  navButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "50%",
  },
  navButtonIcon: {
    height: 40,
    width: 40,
  },
});
