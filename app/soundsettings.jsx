// App.js
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

export default function SoundSettings() {
  const router = useRouter();

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
            color: "#f453b6",
            fontFamily: "TTMilksCasualPie",
            fontSize: 30,
          }}
        >
          Configurações de som
        </Text>
      </View>

      <View>
        <Text>Musica</Text>

        {/* make a slider */}
        <TextInput
          style={{
            width: 200,
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 20,
          }}
          placeholder="Volume"
          keyboardType="numeric"
        />

        {/* make a sound slider */}
        <TextInput
          style={{
            width: 200,
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 20,
          }}
          placeholder="Efeitos"
          keyboardType="numeric"
        />
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
