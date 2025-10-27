import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";
import PinkButton from "@/components/pinkbutton";

import { useAuth } from "@/context/AuthContext";
import { useGameProgress } from "@/context/GameContext";
import { useRegistration } from "@/context/RegistrationContext";
import GameProgressService from "@/services/gameProgressService";
import { logger } from "../../utils/logger";

const profileImageOptions = [
  {
    key: "perfil_tuti.png",
    source: require("@/assets/images/perfis/profile_placeholder.png"),
  },
  {
    key: "perfil_baiacu.png",
    source: require("@/assets/images/perfis/baiacu_perfil.png"),
  },
  {
    key: "perfil_baleia.png",
    source: require("@/assets/images/perfis/baleia_perfil.png"),
  },
  {
    key: "perfil_carangueijo.png",
    source: require("@/assets/images/perfis/carangueijo_perfil.png"),
  },
  {
    key: "perfil_estrela.png",
    source: require("@/assets/images/perfis/estrela_perfil.png"),
  },
  {
    key: "perfil_peixe.png",
    source: require("@/assets/images/perfis/peixe_perfil.png"),
  },
  {
    key: "perfil_tubarao.png",
    source: require("@/assets/images/perfis/tubarao_perfil.png"),
  },
];

export default function CustomizarPerfil() {
  const params = useLocalSearchParams();
  const isEditMode = params.mode === "edit"; // Detecta se é modo edição

  // Hooks condicionais baseados no modo
  const { registrationData, setRegistrationData } = useRegistration();
  const { user } = useAuth();
  const { currentChildId } = useGameProgress();

  const { width } = Dimensions.get("window");
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [childProfile, setChildProfile] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Carregar dados no modo edição
  useEffect(() => {
    if (isEditMode) {
      loadCurrentProfile();
    } else {
      // Modo registro: usar dados do contexto
      setUsername(registrationData.usuario || "");
      const initialImageIndex = profileImageOptions.findIndex(
        (img) => img.key === registrationData.profileImageKey
      );
      setCurrentImageIndex(initialImageIndex !== -1 ? initialImageIndex : 0);
      setLoading(false);
    }
  }, [isEditMode, currentChildId, user]);

  const loadCurrentProfile = async () => {
    if (!user || !currentChildId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const service = new GameProgressService();
      const profiles = await service.getChildrenProfiles(user.uid);
      const profile = profiles.find((p) => p.id === currentChildId);

      if (profile) {
        setChildProfile(profile);
        setUsername(profile.name || "");

        const imageIndex = profileImageOptions.findIndex(
          (img) => img.key === profile.avatar
        );
        setCurrentImageIndex(imageIndex !== -1 ? imageIndex : 0);
      }
    } catch (error) {
      logger.error("❌ Erro ao carregar perfil:", error);
      Alert.alert("Erro", "Não foi possível carregar o perfil da criança.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === profileImageOptions.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? profileImageOptions.length - 1 : prevIndex - 1
    );
  };

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    if (trimmedUsername === "") {
      setIsUsernameValid(false);
      return;
    }

    setIsUsernameValid(true);

    if (profileImageOptions.length === 0) {
      Alert.alert("Erro", "Nenhuma imagem de perfil disponível para seleção.");
      return;
    }

    const selectedImage = profileImageOptions[currentImageIndex];

    if (isEditMode) {
      // Modo edição: salvar no Firebase
      if (!user || !currentChildId) {
        Alert.alert("Erro", "Usuário ou perfil da criança não encontrado.");
        return;
      }

      setSaving(true);

      try {
        const service = new GameProgressService();
        const result = await service.updateChildProfile(user.uid, currentChildId, {
          username: trimmedUsername,
          avatar_url: selectedImage.key,
        });

        if (result.success) {
          Alert.alert("Sucesso!", "Perfil atualizado com sucesso!", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
        } else {
          Alert.alert("Erro", result.error || "Não foi possível atualizar o perfil.");
        }
      } catch (error) {
        logger.error("❌ Erro ao salvar perfil:", error);
        Alert.alert("Erro", "Ocorreu um erro inesperado. Tente novamente.");
      } finally {
        setSaving(false);
      }
    } else {
      // Modo registro: salvar no contexto
      setRegistrationData({
        usuario: trimmedUsername,
        imagemPerfil: selectedImage.key,
      });
      router.replace("./concluido");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#9d59ff" />
        <Text style={{ marginTop: 16, fontFamily: "TTMilksCasualPie", color: "#666" }}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bg_cprofile.png")}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1, // Permite que o conteúdo cresça e o scroll funcione se necessário
          alignItems: "center", // Centraliza o conteúdo horizontalmente
          // justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 26, // Espaço no topo dentro do scroll
          paddingBottom: 30, // Espaço na base dentro do scroll
          gap: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <BackButton />
        </View>

        <Text
          style={{
            fontFamily: "TTMilksCasualPie",
            color: "#004aad",
            textTransform: "uppercase",
            fontSize: 24,
            textAlign: "center",
          }}
        >
          {isEditMode ? (
            <>
              <Text style={{ color: "#b07aff" }}>Personalizar</Text> Perfil
            </>
          ) : (
            <>
              Agora Vamos <Text style={{ color: "#b07aff" }}>customizar</Text> seu perfil!
            </>
          )}
        </Text>

        <Text
          style={{
            fontSize: 18,
            color: "rgba(72, 137, 157, 0.81)",
            fontFamily: "TTMilksCasualPie",
            textAlign: "center",
          }}
        >
          {isEditMode ? "Altere o nome e avatar:" : "preencha os itens abaixo:"}
        </Text>

        <DefaultInput
          placeholder="NOME DE USUÁRIO:"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />

        {!isUsernameValid && (
          <Text
            style={{
              fontSize: 16,
              color: "#ff0000",
              fontFamily: "TTMilksCasualPie",
              textAlign: "center",
            }}
          >
            Nome de usuário inválido!
          </Text>
        )}

        <View>
          <Text
            style={{
              fontSize: 18,
              color: "rgba(72, 137, 157, 0.81)",
              fontFamily: "TTMilksCasualPie",
              // marginTop: 20,
              textAlign: "center",
            }}
          >
            Escolha Uma foto:
          </Text>

          <View
            style={{
              // flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
              width: "100%",
              marginTop: 10,
            }}
          >
            <TouchableOpacity onPress={handlePreviousImage}>
              <Image
                source={require("@/assets/images/icons/arrow_icon.png")}
                style={{
                  transform: [{ rotateY: "180deg" }],
                  width: 35,
                  height: 35,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <Image
              source={
                profileImageOptions.length > 0
                  ? profileImageOptions[currentImageIndex].source
                  : require("@/assets/images/perfis/profile_placeholder.png")
              }
              style={{
                width: "70%",
                aspectRatio: 1, // Mantém a proporção quadrada da imagem
                marginHorizontal: 20, // Espaçamento horizontal entre as imagens
                backgroundColor: "#fff", // Fundo branco para a imagem
                borderRadius: 99999, // Bordas arredondadas
              }}
            />

            <TouchableOpacity onPress={handleNextImage}>
              <Image
                source={require("@/assets/images/icons/arrow_icon.png")}
                style={{
                  width: 35,
                  height: 35,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>

        <PinkButton
          title={isEditMode ? (saving ? "Salvando..." : "Salvar Alterações") : "Próximo"}
          onPress={handleSave}
          disabled={saving}
          style={{
            marginTop: "15%",
            opacity: saving ? 0.6 : 1,
            padding: 10,
            // paddingHorizontal: 20,
            // width: "100%",
            textAlign: "center",
            width: "75%",
          }}
        />
      </ScrollView>
    </ImageBackground>
  );
}
