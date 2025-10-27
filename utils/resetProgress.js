import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import GameProgressService from "../services/gameProgressService";

export const resetGameProgress = async (user, currentChildId) => {
  if (!user || !currentChildId) {
    Alert.alert("Erro", "Usuário ou criança não encontrados.");
    return;
  }

  try {
    Alert.alert(
      "Resetar Progresso",
      `Tem certeza que deseja resetar todo o progresso da criança selecionada? Esta ação não pode ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Resetar",
          style: "destructive",
          onPress: async () => {
            try {
              const gameService = new GameProgressService();

              // console.log(`🔄 Resetando progresso da criança ${currentChildId}...`);

              // Resetar progresso no Firebase
              const result = await gameService.resetChildProgress(
                user.uid,
                currentChildId
              );

              if (result.success) {
                // Limpar AsyncStorage também
                await AsyncStorage.multiRemove([
                  `@mdt:progress:${user.uid}:${currentChildId}`,
                  "gameProgress",
                  "registrationData",
                  "@mdt:progress:v1",
                ]);

                Alert.alert(
                  "Sucesso",
                  "Progresso resetado com sucesso! As mudanças serão aplicadas automaticamente.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // O GameContext vai recarregar automaticamente via listener
                        // console.log("✅ Progresso resetado com sucesso");
                      },
                    },
                  ]
                );
              } else {
                throw new Error(result.error || "Erro desconhecido ao resetar progresso");
              }
            } catch (error) {
              Alert.alert(
                "Erro",
                "Não foi possível resetar o progresso. Tente novamente."
              );
              console.error("❌ Erro ao resetar progresso:", error);
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error("❌ Erro ao resetar progresso:", error);
  }
};
