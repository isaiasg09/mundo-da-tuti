import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import BackButton from "@/components/backbutton";

// Imagem de avatar padrão, caso nenhuma seja encontrada
const placeholderAvatar = require("@/assets/images/perfis/profile_placeholder.png");

export default function Settings() {
  const router = useRouter();

  const profilePlaceholder = require("../assets/images/perfis/profile_placeholder.png");

  return (
    <View style={styles.container}>
      <View>
        <BackButton
          style={{
            alignSelf: "flex-start",
          }}
        />

        <Text
          style={{
            textTransform: "uppercase",
            color: "#9d59ff",
            fontFamily: "TTMilksCasualPie",
            fontSize: 30,
          }}
        >
          Configurações
        </Text>
      </View>

      <View>
        <Image source={profilePlaceholder} style={styles.profileImage}></Image>

        <Text>mudar avatar</Text>

        <TextInput>usuario</TextInput>
      </View>

      <View>
        <TouchableOpacity onPress={() => router.navigate("/soundsettings")}>
          <Text>Sons</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>Preferência</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>privacidade</Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity>
          <Text>termos e politicas de uso</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text>sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef294",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 20,
  },
});
