import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function BackButton({ chirdren, style }) {
  const backIcon = require("../assets/images/icons/back_icon.png");

  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => router.dismiss(1)}
    >
      <Image source={backIcon} style={styles.buttonIcon} resizeMode="cover" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "50%",
  },
  buttonIcon: {
    height: 40,
    width: 40,
  },
});
