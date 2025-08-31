import React from "react";
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function SimpleNavBar({ children, style }) {
  const personIcon = require("../assets/images/icons/person_icon.png");
  const houseIcon = require("../assets/images/icons/house_icon.png");
  const cfgIcon = require("../assets/images/icons/cfg_icon.png");

  const router = useRouter();

  return (
    <View style={[styles.topNav, style]} pointerEvents="auto">
      <TouchableOpacity style={styles.navButton} onPress={() => {}}>
        <Image source={personIcon} style={styles.navButtonIcon} resizeMode="cover" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/home")}>
        <Image source={houseIcon} style={styles.navButtonIcon} resizeMode="cover" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/settings")}>
        <Image source={cfgIcon} style={styles.navButtonIcon} resizeMode="cover" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
    elevation: 5,
  },
  navButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 9999,
  },
  navButtonIcon: {
    height: 40,
    width: 40,
  },
});
