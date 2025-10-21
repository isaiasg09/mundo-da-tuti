import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const resetGameProgress = async () => {
  try {
    Alert.alert(
      "Resetar Progresso",
      "Tem certeza que deseja resetar todo o progresso do jogo? Esta ação não pode ser desfeita.",
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
              // Limpar AsyncStorage
              await AsyncStorage.multiRemove([
                "gameProgress",
                "registrationData",
                "@mdt:progress:v1",
              ]);

              Alert.alert(
                "Sucesso",
                "Progresso resetado com sucesso! Reinicie o app para ver as mudanças.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Opcional: forçar reload da tela
                      if (typeof window !== "undefined") {
                        window.location.reload();
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert("Erro", "Não foi possível resetar o progresso.");
              console.error("Erro ao resetar progresso:", error);
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error("Erro ao resetar progresso:", error);
  }
};
