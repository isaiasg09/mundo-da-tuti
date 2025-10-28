import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import React from "react";
import BackButton from "../components/backbutton";
import PinkButton from "../components/pinkbutton";

import { useAuth } from "@/context/AuthContext";
import { useGameProgress } from "@/context/GameContext";
import GameProgressService from "@/services/gameProgressService";
import { PROFILE_IMAGE_OPTIONS } from "../constants/paths";
import { logger } from "../utils/logger";

const { width } = Dimensions.get("window");

export default function Settings() {
  const { logout, user } = useAuth(); // Hook do contexto de autenticação
  const { currentChildId } = useGameProgress();
  const [childProfile, setChildProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Carregar perfil da criança atual
  React.useEffect(() => {
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
      const profile = profiles.find((p) => p.id === currentChildId);
      setChildProfile(profile);
    } catch (error) {
      logger.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  function goToScreen(screenName) {
    router.navigate(`./${screenName}`);
  }

  // Função para fazer logout
  const handleLogout = async () => {
    Alert.alert("Logout", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        onPress: async () => {
          // console.log("🚪 Iniciando logout...");
          const result = await logout();
          if (result.success) {
            // console.log("✅ Logout realizado com sucesso");
            router.replace("/login"); // Redireciona para a tela de login após logout
          } else {
            logger.error("Erro no logout:", result.error);
            Alert.alert("Erro", "Não foi possível fazer logout. Tente novamente.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground // fundo
        source={require("../assets/images/config_bg.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.container}>
          <BackButton style={{ position: "absolute", top: 10, left: 20 }} />

          <Text style={styles.title}>Configurações</Text>

          {loading ? (
            <View
              style={[styles.foto, { justifyContent: "center", alignItems: "center" }]}
            >
              <Text style={{ color: "#666", fontFamily: "TTMilksCasualPie" }}>
                Carregando...
              </Text>
            </View>
          ) : (
            <Image
              source={
                childProfile?.avatar
                  ? PROFILE_IMAGE_OPTIONS.find(
                      (option) => option.key === childProfile.avatar
                    )?.source ||
                    require("../assets/images/perfis/profile_placeholder.png")
                  : require("../assets/images/perfis/profile_placeholder.png")
              }
              style={styles.foto}
            />
          )}

          <Text style={styles.childName}>
            {loading ? "Carregando..." : childProfile?.name || "Nome da Criança"}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/register/customizarperfil?mode=edit")}
          >
            <Text style={styles.subTitle}>Personalizar Perfil</Text>
          </TouchableOpacity>

          <PinkButton
            title="SONS"
            onPress={() => goToScreen("sons")}
            style={{
              width: "75%",
              padding: 0,
              marginTop: 20,
              elevation: 0,
              backgroundColor: "#ff55a7",
            }}
          />
          <PinkButton
            title="PREFERÊNCIAS"
            onPress={() => goToScreen("preferencias")}
            style={{
              width: "75%",
              padding: 0,
              elevation: 0,
              backgroundColor: "#ff66c4",
            }}
          />
          <PinkButton
            title="PRIVACIDADE"
            onPress={() => goToScreen("priv_cod")}
            style={{
              width: "75%",
              padding: 0,
              elevation: 0,
              backgroundColor: "#ff78cb",
            }}
          />

          <Text style={styles.subTitle}>Quem Somos?</Text>

          <Text style={styles.text}>Termos e políticas de uso</Text>

          <PinkButton
            title="SAIR"
            style={{ backgroundColor: "#ff0734", paddingVertical: 10 }}
            onPress={handleLogout}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  foto: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 100,
    resizeMode: "cover",
  },

  container: {
    flex: 1,
    gap: 15,
    padding: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  safeArea: {
    alignItems: "center",
    flex: 1,
  },

  title: {
    textTransform: "uppercase",
    color: "#9d59ff",
    fontSize: 24,
    fontFamily: "TTMilksCasualPie",
  },

  childName: {
    color: "#004aad",
    fontFamily: "TTMilksCasualPie",
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
  },

  subTitle: {
    color: "#f56796",
    fontFamily: "TTMilksCasualPie",
  },
  text: {
    color: "#ff3e3e",
    fontFamily: "TTMilksCasualPie",
    fontSize: 14,
    marginTop: 10,
  },

  input: {
    width: width * 0.8,
    fontSize: 16,
    fontFamily: "TTMilksCasualPie",
    borderRadius: 15,
    backgroundColor: "#fbfefe",
    borderWidth: 0,
    borderColor: "#121214",
    paddingVertical: 10,
    paddingLeft: 20,
  },
});
