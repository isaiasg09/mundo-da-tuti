import React from "react";
import { Image, Text, View } from "react-native";

import BackButton from "@/components/backbutton";
import Conquista from "@/components/conquista";
import ProgressBar from "@/components/progressbar";

export default function Perfil() {
  return (
    <View
      style={{ flex: 1, padding: 16, alignItems: "center", backgroundColor: "#fef294" }}
    >
      <BackButton style={{ position: "absolute", top: 40, left: 16 }} />

      <Text
        style={{
          fontSize: 36,
          marginTop: 40,
          marginBottom: 16,
          color: "#9d59ff",
          fontFamily: "TTMilksCasualPie",
        }}
      >
        Perfil
      </Text>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginBottom: 32,
          width: "90%",
          // padding: 16,
          borderRadius: 16,
        }}
      >
        <Image
          source={require("@/assets/images/perfis/profile_placeholder.png")}
          style={{
            width: "30%",
            aspectRatio: 1, // Mantém a proporção quadrada da imagem
            marginRight: 16, // Espaçamento horizontal entre as imagens
            backgroundColor: "#fff", // Fundo branco para a imagem
            borderRadius: 99999, // Bordas arredondadas
          }}
        />

        <View style={{ flex: 1, justifyContent: "center", gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text
              style={{ fontSize: 16, fontFamily: "TTMilksCasualPie", color: "#f56796" }}
            >
              Nome do Usuário
            </Text>

            <Text style={{ fontFamily: "TTMilksCasualPie", color: "#f56796" }}>
              Nível
            </Text>
          </View>

          <ProgressBar step={0.5} totalSteps={1} style={{ width: "100%" }} />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: "90%",
          marginTop: 32,
          textAlign: "center",
          gap: 16,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: "TTMilksCasualPie", color: "#004aad", fontSize: 18 }}>
          Atividades Realizadas:
        </Text>
        <Text
          style={{
            fontFamily: "TTMilksCasualPie",
            color: "#ffffff",
            fontSize: 18,
            backgroundColor: "#9d59ff",
            paddingHorizontal: 14,
            borderRadius: 99999,
          }}
        >
          10
        </Text>
      </View>

      <View
        style={{
          flexDirection: "column",
          gap: 16,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 84,
        }}
      >
        <Text style={{ fontFamily: "TTMilksCasualPie", color: "#f56796", fontSize: 22 }}>
          Conquistas:
        </Text>

        <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
          <Conquista
            title={"Estudo Focado"}
            image={require("@/assets/images/conquistas/conquista1.webp")}
            unlocked={true}
          />
          <Conquista
            title={"Imbatível!"}
            image={require("@/assets/images/conquistas/conquistaperola.webp")}
            unlocked={true}
          />
          <Conquista
            title={"Mestre do Cálculo"}
            image={require("@/assets/images/conquistas/conquistacalculo.webp")}
            unlocked={true}
          />

          <Conquista unlocked={false} />
          <Conquista unlocked={false} />
          <Conquista unlocked={false} />
        </View>
      </View>
    </View>
  );
}
