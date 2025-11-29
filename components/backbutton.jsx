import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

export default function BackButton({ children, style, onPress }) {
  const backIcon = require("../assets/images/icons/back_icon.png");

  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(); // Se uma ação customizada foi passada, usa ela
    } else {
      // Comportamento padrão mais seguro - usar back() em vez de dismiss()
      // para evitar limpeza excessiva da pilha de navegação
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/home"); // Fallback seguro
      }
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress}>
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
