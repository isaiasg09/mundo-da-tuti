import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { router } from "expo-router";

import PinkButton from "@/components/pinkbutton";
import BackButton from "../components/backbutton";
import Conquista from "../components/conquista";
import ProgressBar from "../components/progressbar";

import { useAuth } from "@/context/AuthContext";
import { useGameProgress } from "@/context/GameContext";
import GameProgressService from "@/services/gameProgressService";

import { PROFILE_IMAGE_OPTIONS } from "../constants/paths";

export default function Perfil() {
  const { user } = useAuth();
  const { gameProgress, currentChildId, getTotalGamesCompleted } = useGameProgress();
  const [childProfile, setChildProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildProfile();
  }, [currentChildId, user]);

  const loadChildProfile = async () => {
    if (!user || !currentChildId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const service = new GameProgressService();
      const profiles = await service.getChildrenProfiles(user.uid);

      console.log(profiles);

      const profile = profiles.find((p) => p.id === currentChildId);

      console.log(currentChildId);
      setChildProfile(profile);
      console.log(profile);
    } catch (error) {
      console.error("❌ Erro ao carregar perfil da criança:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(childProfile);

  // Calcular conquistas baseadas no progresso
  const getAchievements = () => {
    const totalGames = getTotalGamesCompleted();
    const paths = gameProgress.paths;

    const achievements = [
      {
        title: "Estudo Focado",
        image: require("@/assets/images/conquistas/conquista1.webp"),
        unlocked: totalGames >= 1, // Primeira atividade concluída
      },
      {
        title: "Imbatível!",
        image: require("@/assets/images/conquistas/conquistaperola.webp"),
        unlocked:
          paths.molusco_perola?.status === "unlocked" ||
          paths.molusco_perola?.status === "completed",
      },
      {
        title: "Mestre do Cálculo",
        image: require("@/assets/images/conquistas/conquistacalculo.webp"),
        unlocked: totalGames >= 5, // 5 atividades concluídas
      },
      {
        title: "Explorador",
        unlocked: totalGames >= 10, // 10 atividades concluídas
      },
      {
        title: "Campeão",
        unlocked:
          paths.anemona?.status === "unlocked" || paths.anemona?.status === "completed",
      },
      {
        title: "Dedicado",
        unlocked: totalGames >= 15, // 15 atividades concluídas
      },
    ];

    return achievements;
  };

  const avatarSource = childProfile?.avatar
    ? PROFILE_IMAGE_OPTIONS.find((option) => option.key === childProfile.avatar)
        ?.source || require("@/assets/images/perfis/profile_placeholder.png")
    : require("@/assets/images/perfis/profile_placeholder.png");

  // Debug log para verificar o avatar
  console.log("🖼️ Avatar key:", childProfile?.avatar);
  console.log(
    "🖼️ Avatar source found:",
    !!PROFILE_IMAGE_OPTIONS.find((option) => option.key === childProfile?.avatar)
  );

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
        <View
          style={{
            width: "30%",
            aspectRatio: 1,
            marginRight: 16,
            backgroundColor: childProfile?.color || "#fff",
            borderRadius: 99999,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : childProfile?.avatar ? (
            <Image
              source={avatarSource}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 99999,
              }}
            />
          ) : (
            <Image
              source={require("@/assets/images/perfis/profile_placeholder.png")}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 99999,
              }}
            />
          )}
        </View>

        <View style={{ flex: 1, justifyContent: "center", gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text
              style={{ fontSize: 16, fontFamily: "TTMilksCasualPie", color: "#f56796" }}
            >
              {loading ? "Carregando..." : childProfile?.name || "Nome de usuário"}
            </Text>

            <Text style={{ fontFamily: "TTMilksCasualPie", color: "#f56796" }}>
              Nível {Math.floor(getTotalGamesCompleted() / 3) + 1}
            </Text>
          </View>

          <ProgressBar
            step={getTotalGamesCompleted() % 3}
            totalSteps={3}
            style={{ width: "100%" }}
          />
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
          {getTotalGamesCompleted()}
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
          {getAchievements().map((achievement, index) => (
            <Conquista
              key={index}
              title={achievement.title}
              image={achievement.image}
              unlocked={achievement.unlocked}
            />
          ))}
        </View>
      </View>
      <PinkButton
        title="GERENCIAR PERFIS"
        onPress={() => router.push("/childSelector")}
        style={{
          width: "75%",
          height: 50,
          padding: 0,
          paddingHorizontal: 20,
          elevation: 0,
          backgroundColor: "#ff89d2",
          marginTop: 20,
        }}
      />
    </View>
  );
}
