import { router } from "expo-router";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/backbutton";
import MySwitchComponent from "../components/switch";

export default function Preferencias() {
  function goBack() {
    router.navigate("/");
  }

  return (
    <ImageBackground
      source={require("../assets/images/config_bg.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <BackButton style={{ position: "absolute", top: 10, left: 20 }} />
        <View style={styles.container}>
          <View style={styles.rows}>
            <Text style={styles.title}>Preferências</Text>
          </View>
          <View style={styles.boxConfigs}>
            <MySwitchComponent title="Vibrações" />
            <MySwitchComponent title="Lembretes" />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    gap: 15,
    padding: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%", // Garante que a View não encolha
  },

  title: {
    color: "#f56796",
    fontSize: 24,
    fontFamily: "TTMilksCasualPie",
  },

  boxConfigs: {
    backgroundColor: "#ffdb4d5e",
    padding: 20,
    paddingLeft: 30,
    width: "90%",
    borderRadius: 20,
    // height: 250,
  },

  rows: {
    flexDirection: "row",
    alignItems: "center",
  },
});
