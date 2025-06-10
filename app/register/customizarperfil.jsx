import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import BackButton from "@/components/backbutton";
import DefaultInput from "@/components/defaultinput";
import PinkButton from "@/components/pinkbutton";
import { router } from "expo-router";

import { useRegistration } from "@/context/RegistrationContext"; // Importa o hook do contexto

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
  // Inicializa o username com o valor do contexto, se existir
  const { registrationData, setRegistrationData } = useRegistration(); // Hook do contexto
  const [username, setUsername] = useState(registrationData.usuario || "");

  const [isUsernameValid, setIsUsernameValid] = useState(true);

  // Encontra o índice inicial da imagem com base no que está salvo no contexto
  const initialImageIndex = profileImageOptions.findIndex(
    (img) => img.key === registrationData.profileImageKey
  );
  // Estado para o índice da imagem de perfil atualmente selecionada
  const [currentImageIndex, setCurrentImageIndex] = useState(
    initialImageIndex !== -1 ? initialImageIndex : 0 // Começa com a salva ou a primeira
  );

  // Função para ir para a próxima imagem no array de avatares
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === profileImageOptions.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Função para ir para a imagem anterior no array de avatares
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? profileImageOptions.length - 1 : prevIndex - 1
    );
  };

  function handleGoNext() {
    const trimmedUsername = username.trim();
    if (trimmedUsername === "") {
      setIsUsernameValid(false);
      // Alert.alert("Atenção!", "Por favor, digite um nome de usuário.");
      return;
    }

    setIsUsernameValid(true);

    if (profileImageOptions.length === 0) {
      Alert.alert("Erro", "Nenhuma imagem de perfil disponível para seleção.");
      return;
    }

    const selectedImage = profileImageOptions[currentImageIndex];

    // Salva o nome de usuário e a chave da imagem de perfil no contexto
    setRegistrationData({
      usuario: trimmedUsername,
      imagemPerfil: selectedImage.key,
    });

    // Navega para a tela de conclusão (ou próxima etapa do cadastro)
    router.replace("./concluido"); // Use replace para não voltar para esta tela
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
          Agora Vamos <Text style={{ color: "#b07aff" }}>customizar</Text> seu
          perfil!
        </Text>

        <Text
          style={{
            fontSize: 18,
            color: "rgba(72, 137, 157, 0.81)",
            fontFamily: "TTMilksCasualPie",
            // marginTop: 20,
            textAlign: "center",
          }}
        >
          preencha os itens abaixo:
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
              justifyContent: "center",
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
          title={"Próximo"}
          onPress={handleGoNext}
          style={{ marginTop: "15%" }}
        />
      </ScrollView>
    </ImageBackground>
  );
}
