// app/childSelector.jsx
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import BackButton from "../components/backbutton";
import { PROFILE_IMAGE_OPTIONS } from "../constants/paths";
import { useAuth } from "../context/AuthContext";
import { useGameProgress } from "../context/GameContext";
import GameProgressService from "../services/gameProgressService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ChildSelector() {
  const router = useRouter();
  const { setActiveChild, currentChildId, isLoading } = useGameProgress();
  const [selectedChild, setSelectedChild] = useState(currentChildId);
  const [isSelecting, setIsSelecting] = useState(false);
  const [children, setChildren] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Carregar perfis reais quando componente monta
  React.useEffect(() => {
    loadChildrenProfiles();
  }, []);

  const { user } = useAuth();

  const loadChildrenProfiles = async () => {
    try {
      setLoadingProfiles(true);

      if (user) {
        const service = new GameProgressService();
        const profiles = await service.getChildrenProfiles(user.uid);
        setChildren(profiles);
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar perfis:", error);
      setChildren([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleChildSelect = async (childId) => {
    if (isSelecting) return;
    if (selectedChild === childId) return;

    setIsSelecting(true);
    try {
      // Atualizar criança ativa
      setActiveChild(childId);
      setSelectedChild(childId);

      // Aguardar um pouco para mostrar feedback visual
      setTimeout(() => {
        router.replace("/home");
      }, 1000);
    } catch (error) {
      console.error("❌ Erro ao selecionar criança:", error);
      Alert.alert("Erro", "Não foi possível selecionar esta criança. Tente novamente.");
      setIsSelecting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading || loadingProfiles) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Carregando perfis...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/bg_register.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="dark" />

      {/* Header */}
      {/* <View style={styles.header}> */}
      <BackButton
        onPress={handleBack}
        style={{ position: "absolute", top: 30, left: 20 }}
      />
      {/* </View> */}

      <View style={styles.container}>
        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ESCOLHA SEU PERFIL</Text>
          <Text style={styles.subtitle}>Selecione qual criança vai jogar</Text>
        </View>

        {/* Lista de Crianças */}
        <View style={styles.childrenContainer}>
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum perfil encontrado</Text>
              <Text style={styles.emptyStateSubtext}>
                Crie o primeiro perfil da criança para começar!
              </Text>
            </View>
          ) : (
            children.map((child) => {
              const isSelected = selectedChild === child.id;
              const isCurrentlySelecting = isSelecting && isSelected;

              return (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childCard,
                    isSelected && styles.childCardSelected,
                    { borderColor: child.color },
                  ]}
                  onPress={() => handleChildSelect(child.id)}
                  disabled={isSelecting}
                  activeOpacity={0.7}
                >
                  {/* Avatar */}
                  <View
                    style={[styles.avatarContainer, { backgroundColor: child.color }]}
                  >
                    <Image
                      source={
                        child.avatar && typeof child.avatar === "string"
                          ? PROFILE_IMAGE_OPTIONS.find(
                              (option) => option.key === child.avatar
                            )?.source ||
                            require("../assets/images/perfis/profile_placeholder.png")
                          : require("../assets/images/perfis/profile_placeholder.png")
                      }
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                    {isCurrentlySelecting && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    )}
                  </View>

                  {/* Nome */}
                  <Text style={styles.childName}>{child.name}</Text>

                  {/* Status */}
                  {isSelected && !isSelecting && (
                    <Text style={styles.selectedText}>Selecionado</Text>
                  )}
                  {isCurrentlySelecting && (
                    <Text style={styles.selectingText}>Carregando...</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Botão Criar Novo Perfil */}
        <TouchableOpacity
          style={styles.addChildButton}
          onPress={() =>
            window.alert("Funcionalidade de ainda não implementada!", "Em breve")
          }
        >
          <Text style={styles.addChildIcon}>+</Text>
          <Text style={styles.addChildText}>Criar Novo Perfil</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A90E2",
  },
  loadingText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(16),
    color: "white",
    fontFamily: "TTMilksCasualPie",
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: "space-between",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: verticalScale(40),
    marginTop: verticalScale(80),
  },
  title: {
    fontSize: moderateScale(28, 0.5),
    color: "#FFFFFF",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginBottom: verticalScale(10),
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: "#d0ff25ff",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
  },
  childrenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: verticalScale(20),
  },
  childCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: moderateScale(20),
    padding: scale(20),
    alignItems: "center",
    minWidth: scale(280),
    borderWidth: 3,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  childCardSelected: {
    borderWidth: 4,
    backgroundColor: "rgba(255, 255, 255, 1)",
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 12,
  },
  avatarContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(15),
    position: "relative",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: scale(40),
  },
  avatar: {
    fontSize: moderateScale(40),
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  childName: {
    fontSize: moderateScale(24, 0.5),
    color: "#333",
    fontFamily: "TTMilksCasualPie",
    marginBottom: verticalScale(5),
  },
  selectedText: {
    fontSize: moderateScale(14),
    color: "#4CAF50",
    fontFamily: "TTMilksCasualPie",
    fontWeight: "bold",
  },
  selectingText: {
    fontSize: moderateScale(14),
    color: "#FF9800",
    fontFamily: "TTMilksCasualPie",
  },
  addChildButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: moderateScale(15),
    borderWidth: 2,
    borderColor: "white",
    borderStyle: "dashed",
    padding: scale(20),
    alignItems: "center",
    marginBottom: verticalScale(40),
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(40),
  },
  emptyStateText: {
    fontSize: moderateScale(20),
    color: "white",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginBottom: verticalScale(10),
  },
  emptyStateSubtext: {
    fontSize: moderateScale(16),
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
  },
  addChildIcon: {
    fontSize: moderateScale(30),
    color: "white",
    fontFamily: "TTMilksCasualPie",
    marginBottom: verticalScale(5),
  },
  addChildText: {
    fontSize: moderateScale(16),
    color: "white",
    fontFamily: "TTMilksCasualPie",
  },
});
