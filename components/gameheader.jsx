import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import BackButton from "@/components/backbutton";

export default function GameHeader({ onBackPress }) {
  const soundIcon = require("../assets/images/icons/sound_icon.png");
  const router = useRouter();

  // Função customizada para navegação do back button
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress(); // Usa a função personalizada se fornecida
    } else {
      // Sempre vai para home para evitar voltar para telas de vitória ou login
      router.replace("/home");
    }
  };

  return (
    <View style={styles.header}>
      <BackButton onPress={handleBackPress} />
      <TouchableOpacity style={styles.soundButton}>
        <Image source={soundIcon} style={styles.soundIcon} contentFit="contain" />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 10,
    marginTop: 20, // Ajuste para SafeArea se necessário
  },
  soundButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 50, // Círculo perfeito
  },
  soundIcon: {
    width: 43,
    height: 35,
  },
});
