import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

import { router } from "expo-router";

import PinkButton from "@/components/pinkbutton";
import AchievementModal from "../components/achievementmodal";
import BackButton from "../components/backbutton";
import Conquista from "../components/conquista";
import ProgressBar from "../components/progressbar";

import { useAchievementContext } from "@/context/AchievementContext";
import { useAuth } from "@/context/AuthContext";
import { useGameProgress } from "@/context/GameContext";
import GameProgressService from "@/services/gameProgressService";
import { logger } from "../utils/logger";

import { PROFILE_IMAGE_OPTIONS } from "../constants/paths";

export default function Perfil() {
  const { user } = useAuth();
  const { gameProgress, currentChildId, getTotalGamesCompleted, setActiveChild } =
    useGameProgress();
  const { mapAllAchievements } = useAchievementContext();
  const [childProfile, setChildProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Carregar perfil da criança ao montar o componente ou quando currentChildId mudar
  useEffect(() => {
    loadChildProfile();
  }, [currentChildId, user]);

  // Carregar conquistas quando o perfil mudar
  useEffect(() => {
    if (childProfile?.achievements) {
      const mappedAchievements = mapAllAchievements(childProfile.achievements);
      setAchievements(mappedAchievements);
    }
  }, [childProfile, mapAllAchievements]);

  // função assincrona para carregar o perfil da criança
  const loadChildProfile = async () => {
    // se não houver usuário, não tenta carregar
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const service = new GameProgressService();
      const profiles = await service.getChildrenProfiles(user.uid);

      if (!currentChildId && profiles.length > 0) {
        // Seleciona a primeira criança como ativa se nenhuma estiver selecionada
        setActiveChild(profiles[0].id);
      }

      const profile = profiles.find((p) => p.id === (currentChildId || profiles[0]?.id));

      // Carregar dados completos do perfil incluindo conquistas
      if (profile) {
        try {
          const progressRef = service.getProgressRef(user.uid, profile.id);
          const { getDoc } = await import("firebase/firestore");
          const doc = await getDoc(progressRef);
          if (doc.exists()) {
            const data = doc.data();
            setChildProfile({
              ...profile,
              ...data.profile,
              achievements: data.achievements || {},
            });
          } else {
            setChildProfile(profile);
          }
        } catch (error) {
          logger.error("❌ Erro ao carregar dados do perfil:", error);
          setChildProfile(profile);
        }
      } else {
        setChildProfile(null);
      }
    } catch (error) {
      logger.error("❌ Erro ao carregar perfil da criança:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de conquista
  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAchievement(null);
  };

  const avatarSource = childProfile?.avatar
    ? PROFILE_IMAGE_OPTIONS.find((option) => option.key === childProfile.avatar)
        ?.source || require("@/assets/images/perfis/profile_placeholder.png")
    : require("@/assets/images/perfis/profile_placeholder.png");

  // Debug log para verificar o avatar
  // console.log("🖼️ Avatar key:", childProfile?.avatar);
  // console.log(
  //   "🖼️ Avatar source found:",
  //   !!PROFILE_IMAGE_OPTIONS.find((option) => option.key === childProfile?.avatar)
  // );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fef294" }}
      contentContainerStyle={{
        padding: 16,
        alignItems: "center",
        minHeight: "100%",
      }}
      showsVerticalScrollIndicator={false}
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
          marginTop: 16,
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
          marginTop: 32,
        }}
      >
        <Text style={{ fontFamily: "TTMilksCasualPie", color: "#f56796", fontSize: 22 }}>
          Conquistas:
        </Text>

        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
          {achievements.map((achievement) => (
            <Conquista
              key={achievement.id}
              title={achievement.title}
              image={achievement.image}
              unlocked={achievement.unlocked}
              onPress={() => handleAchievementPress(achievement)}
            />
          ))}
        </View>
      </View>
      <PinkButton
        title="GERENCIAR PERFIS"
        onPress={() => router.push("/childSelector")}
        style={{
          // width: "75%",
          // height: 50,
          padding: 20,
          elevation: 0,
          backgroundColor: "#ff89d2",
          marginTop: 20,
        }}
      />

      {/* Modal de Conquista */}
      <AchievementModal
        visible={showModal}
        achievement={selectedAchievement}
        onClose={handleCloseModal}
      />
    </ScrollView>
  );
}
