import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Text,
} from "react-native";
import NavBar from "@/components/navbar";
import { useRouter } from "expo-router";
// Importações do Reanimated que você já tem
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  // runOnJS não é mais necessário com esta abordagem mais simples
} from "react-native-reanimated";
import { useGameProgress } from "@/context/GameContext";

const { width } = Dimensions.get("window");

// Array com as imagens da galeria
const paths = [
  require("../assets/images/castelo.png"),
  require("../assets/images/molusco_perola.png"),
  // Adicione mais imagens aqui se desejar
];

// --- DADOS DOS CAMINHOS ---
// Array de objetos que descreve cada caminho principal do seu jogo
// O 'id' deve corresponder exatamente às chaves que você definiu no seu GameContext
const gamePaths = [
  {
    id: "castelo",
    name: "Caminho do Castelo",
    image: require("../assets/images/castelo.png"), // Imagem do caminho
    route: "/firstpath", // Rota para a tela que mostra os 6 jogos deste caminho
  },
  {
    id: "molusco_perola",
    name: "Caminho da Pérola",
    image: require("../assets/images/molusco_perola.png"),
    route: "/secondpath", // Exemplo de rota para o segundo caminho
  },
  // Adicione seus outros caminhos aqui
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { gameProgress } = useGameProgress(); // progresso global

  // --- LÓGICA DE NAVEGAÇÃO ATUALIZADA ---
  const handlePathNavigate = () => {
    const currentPath = gamePaths[currentIndex]; // Pega os dados do caminho atual
    const pathStatus = gameProgress.paths[currentPath.id]?.status; // Pega o status do contexto

    // Navega apenas se o caminho não estiver bloqueado
    if (pathStatus !== "locked") {
      router.push({
        pathname: currentPath.route, // Rota definida no array gamePaths (ex: '/firstpath')
        params: { pathId: currentPath.id }, // Passa o ID do caminho para a próxima tela
      });
    }
  };

  const arrowIcon = require("../assets/images/icons/arrow_icon.png");
  const lockIcon = require("../assets/images/icons/lock_icon.png"); // Imagem do cadeado

  // --- LÓGICA DE ANIMAÇÃO REFEITA ---

  // Estado para guardar apenas o índice da imagem atual visível
  const [currentIndex, setCurrentIndex] = useState(0);

  // Valores compartilhados para a posição e opacidade das duas imagens
  // 'A' será a imagem que está saindo ou a que está visível
  const translateX_A = useSharedValue(0);
  const opacity_A = useSharedValue(1);
  // 'B' será a imagem que está entrando
  const translateX_B = useSharedValue(width); // Inicia fora da tela
  const opacity_B = useSharedValue(0);

  // Estado para controlar qual imagem ('A' ou 'B') está exibindo o conteúdo atual
  const [isImageA_current, setIsImageA_current] = useState(true);

  // Estilos animados para as duas imagens
  const animatedStyle_A = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX_A.value }],
    opacity: opacity_A.value,
  }));
  const animatedStyle_B = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX_B.value }],
    opacity: opacity_B.value,
  }));

  // Função para trocar as imagens com animação
  const handleArrowPress = (direction) => {
    // Calcula o próximo índice, fazendo o loop no array 'paths'
    const nextIndex =
      direction === "left"
        ? (currentIndex - 1 + paths.length) % paths.length
        : (currentIndex + 1) % paths.length;

    // Define qual imagem (A ou B) entrará e qual sairá
    const [imageIn, imageOut] = isImageA_current
      ? [translateX_B, translateX_A]
      : [translateX_A, translateX_B];

    const [opacityIn, opacityOut] = isImageA_current
      ? [opacity_B, opacity_A]
      : [opacity_A, opacity_B];

    // Define a posição inicial da imagem que vai entrar (fora da tela)
    const startPosition = direction === "right" ? width : -width;
    imageIn.value = startPosition;

    // Atualiza o índice lógico para a nova imagem
    setCurrentIndex(nextIndex);
    // Alterna qual dos componentes (A ou B) é o "atual"
    setIsImageA_current(!isImageA_current);

    // Inicia as animações
    opacityOut.value = withTiming(0, { duration: 200 }); // Imagem antiga some
    imageOut.value = withTiming(-startPosition, { duration: 300 }); // Imagem antiga desliza para fora

    opacityIn.value = withTiming(1, { duration: 200 }); // Imagem nova aparece
    imageIn.value = withTiming(0, { duration: 300 }); // Imagem nova desliza para o centro
  };

  return (
    <ImageBackground
      source={require("@/assets/images/bg_home.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <NavBar />

        <View style={styles.mainContent}>
          <TouchableOpacity onPress={() => handleArrowPress("left")}>
            <Image
              source={arrowIcon}
              style={[
                styles.arrowButton,
                { transform: [{ rotateY: "180deg" }] },
              ]}
              resizeMode="contain" // 'contain' é melhor para ícones
            />
          </TouchableOpacity>

          {/* Wrapper para as imagens do carrossel e o overlay de bloqueio */}
          {(() => {
            // Pega os dados do caminho atual para facilitar a leitura no JSX
            const currentPath = gamePaths[currentIndex];
            // Verifica no contexto se o caminho atual está bloqueado.
            // Usa 'optional chaining' (?) para evitar erros se 'currentPath.id' não existir no progresso
            const isLocked =
              gameProgress.paths[currentPath.id]?.status === "locked";

            return (
              <TouchableOpacity
                style={styles.imageWrapper}
                onPress={handlePathNavigate} // Chama a função de navegação
                disabled={isLocked} // Desabilita o botão se o caminho estiver bloqueado
                activeOpacity={isLocked ? 1 : 0.7} // Sem feedback de toque se estiver bloqueado
              >
                {/* As duas imagens do carrossel, sempre montadas */}
                <Animated.Image
                  source={
                    isImageA_current
                      ? gamePaths[currentIndex].image
                      : gamePaths[
                          (currentIndex - 1 + gamePaths.length) %
                            gamePaths.length
                        ].image
                  }
                  style={[styles.pathImage, animatedStyle_A]}
                  resizeMode="contain"
                />
                <Animated.Image
                  source={
                    !isImageA_current
                      ? gamePaths[currentIndex].image
                      : gamePaths[(currentIndex + 1) % gamePaths.length].image
                  }
                  style={[styles.pathImage, animatedStyle_B]}
                  resizeMode="contain"
                />

                {/* Camada de "Bloqueado" que aparece por cima se isLocked for true */}
                {isLocked && (
                  <View style={styles.lockedOverlay}>
                    <Image source={lockIcon} style={styles.lockIcon} />
                    <Text style={styles.lockedText}>BLOQUEADO</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })()}

          <TouchableOpacity onPress={() => handleArrowPress("right")}>
            <Image
              source={arrowIcon}
              style={styles.arrowButton}
              resizeMode="contain" // 'contain' é melhor para ícones
            />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

// Seus estilos (NÃO FORAM ALTERADOS)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  imageWrapper: {
    width: "60%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    // Removido overflow: "hidden" para não cortar as imagens ao deslizarem
    marginHorizontal: 10,
  },
  pathImage: {
    width: "100%",
    height: "100%",
    position: "absolute", // Ambas as imagens ocupam o mesmo espaço
  },
  arrowButton: {
    width: 35,
    height: 35,
  },
  // --- NOVOS ESTILOS PARA O ESTADO DE "BLOQUEADO" ---
  lockedOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fundo escuro semi-transparente
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20, // Ajuste este valor se as imagens dos seus caminhos tiverem bordas arredondadas
    zIndex: 5, // Garante que fique por cima das imagens do carrossel
  },
  lockIcon: {
    width: 60,
    height: 60,
    tintColor: "#fff", // Deixa a imagem do cadeado branca (funciona melhor com ícones de cor única)
    marginBottom: 10,
  },
  lockedText: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "TTMilksCasualPie",
    fontWeight: "bold",
  },
});
