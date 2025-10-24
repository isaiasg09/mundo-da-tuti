import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { GAME_DIFFICULTY_CONFIG } from "../constants/gameConfig";
import { useGameProgress } from "../context/GameContext";

import BackButton from "../components/backbutton";
import Fish from "../components/fish";
import ProgressBar from "../components/progressbar";
import WinScreen from "../components/winscreen";

const { width: windowWidth } = Dimensions.get("window");

import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useLevelNavigation } from "../hooks/useLevelNavigation";
// Dados de CONFIGURAÇÃO dos jogos deste caminho.
// Define as propriedades que não mudam: ID, nome, rota e posição X no mapa.

// --- NOVOS HELPERS E CONSTANTES ---

// Define cores padronizadas para as bolhas (vermelho para incorreta, verde para correta)
const BUBBLE_COLORS = {
  CORRECT: "#27AE60", // Verde para resposta correta
  INCORRECT: "#E74C3C", // Vermelho para respostas incorretas
};

// Função para gerar um deslocamento vertical aleatório para as bolhas
function getRandomVerticalOffset() {
  const maxOffset = 20; // As bolhas vão variar até 20 pixels para cima ou para baixo
  return Math.random() * maxOffset * 2 - maxOffset; // Gera um valor entre -20 e 20
}

// Total de rodadas/acertos necessários como uma constante
const ROUNDS_TO_WIN = 5;

export default function FishGame() {
  const confettiRef = useRef(null); // Referência para o ConfettiCannon
  const markedRef = useRef(false);

  // Intercepta o botão físico de voltar do Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Se o jogo foi ganho, vai para home; senão volta para o caminho
        if (isGameWon) {
          router.replace("/home");
        } else {
          openMap(); // Volta para o caminho/mapa
        }
        return true; // Previne o comportamento padrão
      };

      // Adiciona o listener para o botão de voltar
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      // Remove o listener quando a tela perde o foco
      return () => subscription?.remove();
    }, [isGameWon, openMap, router])
  );

  // Nova função para disparar os confetes quando a imagem for clicada
  const fireConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.start(); // Inicia a animação de confetes
    }
  };

  const soundIcon = require("../assets/images/icons/sound_icon.png");

  const [fishesData, setFishesData] = useState([]);

  const [options, setOptions] = useState([]); // Agora vai guardar objetos: { value, color, verticalOffset }
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState(null); // Guarda o valor (número) selecionado

  // --- ESTADOS PARA O PROGRESSO ---
  // Conta quantas respostas corretas o jogador já deu
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Controla se o jogador já venceu o jogo (para mostrar a tela de sucesso)
  const [isGameWon, setIsGameWon] = useState(false);

  const { gameProgress, setGameProgress, completeGame } = useGameProgress();
  const {
    pathId,
    gameId,
    contextKey,
    difficulty = "facil", // Pega o parâmetro de dificuldade da rota. Se nenhum for passado, ele assume 'facil' como padrão.
    gameType = "fish", // Pega o parâmetro de tipo de jogo da rota. Se nenhum for passado, ele assume 'soma' como padrão.
  } = useLocalSearchParams();
  const { onWinMarkOnly, openNext, openMap, completeLevel } = useLevelNavigation(pathId);

  // Pega as configurações para a dificuldade atual
  const config = GAME_DIFFICULTY_CONFIG[gameType][difficulty];

  useEffect(() => {
    generateGame();
  }, []);

  // useEffect para marcar como completo na vitória com Firebase sync
  useEffect(() => {
    if (isGameWon && !markedRef.current) {
      const gameIndex = Number(gameId);
      if (gameIndex && pathId) {
        console.log(`[FishGame] Completando jogo com sync: ${pathId}.game${gameIndex}`);

        // Usar a nova função que faz sync com Firebase
        const completeWithScore = async () => {
          try {
            const result = await completeGame(pathId, gameIndex, correctAnswersCount);
            if (result?.success) {
              console.log(`[FishGame] ✅ Jogo completado e sincronizado!`);
              if (result.nextGameUnlocked) {
                console.log(`[FishGame] 🔓 Próximo jogo desbloqueado!`);
              }
              if (result.nextPathUnlocked) {
                console.log(
                  `[FishGame] 🎉 Próximo caminho desbloqueado: ${result.nextPathUnlocked}`
                );
              }
            }
          } catch (error) {
            console.error("[FishGame] ❌ Erro ao completar jogo:", error);
            // Fallback para método local
            onWinMarkOnly(gameIndex);
          }
        };

        completeWithScore();
        markedRef.current = true;
      }
    }
  }, [isGameWon, gameId, pathId, completeGame, correctAnswersCount, onWinMarkOnly]);

  // O container dos peixes pode ser um pouco menor que a altura total para não sobrepor os botões
  const containerHeight = Dimensions.get("window").height * 0.4;

  const generateGame = () => {
    // --- LÓGICA DE GERAÇÃO DE PEIXES ATUALIZADA ---
    const newFishesData = [];
    const usedPositions = [];
    const MIN_DISTANCE = config.minDistance;
    const MIN_SIZE = config.minFishSize;
    const MAX_SIZE = config.maxFishSize;
    const MAX_QUANTITY = config.maxQuantity;

    const quantity = Math.floor(Math.random() * MAX_QUANTITY) + 1;
    const fishAssets = {
      1: require("../assets/images/fishs/fish1.png"),
      2: require("../assets/images/fishs/fish2.png"),
      3: require("../assets/images/fishs/fish3.png"),
      4: require("../assets/images/fishs/fish4.png"),
      5: require("../assets/images/fishs/fish5.png"),
    };

    for (let i = 0; i < quantity; i++) {
      const fishNumber = Math.floor(Math.random() * MAX_QUANTITY) + 1;
      const sizeValue = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
      const size = { width: sizeValue, height: sizeValue };

      let initialPosition,
        tries = 0;
      let overlaps;

      // Gera uma posição inicial que não sobrepõe outros peixes
      do {
        initialPosition = {
          x: Math.floor(Math.random() * (windowWidth - size.width)),
          y: Math.floor(Math.random() * (containerHeight - size.height)),
        };
        overlaps = usedPositions.some((pos) => {
          const dx = pos.x - initialPosition.x;
          const dy = pos.y - initialPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < MIN_DISTANCE;
        });
        tries++;
      } while (overlaps && tries < 100);

      usedPositions.push(initialPosition);

      // Adiciona um objeto com os dados necessários para o componente <Fish />
      newFishesData.push({
        id: `fish-${i}-${Date.now()}`, // Chave única

        source:
          fishNumber in fishAssets ? fishAssets[fishNumber] : fishAssets[fishNumber - 5], // Usa o peixe correspondente ou o peixe 1-5 se o número for maior que 5
        initialPosition,
        size,
      });
    }

    setFishesData(newFishesData); // Salva o array de dados dos peixes
    setCorrect(quantity);
    setOptions(generateOptions(quantity));
    setSelected(null);
  };

  const generateOptions = (correctValue) => {
    const set = new Set();
    set.add(correctValue);

    while (set.size < 3) {
      const fake = Math.floor(Math.random() * config.optionsRange) + 1;
      if (fake !== correctValue) set.add(fake);
    }

    // Converte o Set para um array e embaralha
    const array = Array.from(set).sort(() => Math.random() - 0.5);

    // --- MUDANÇA IMPORTANTE: Mapeia o array de números para um array de objetos ---
    // Cada opção agora terá seu valor, cor baseada na resposta correta, e posição vertical aleatória
    return array.map((value) => ({
      value: value,
      color: value === correct ? BUBBLE_COLORS.CORRECT : BUBBLE_COLORS.INCORRECT,
      verticalOffset: getRandomVerticalOffset(),
    }));
  };

  const handleAnswer = (value) => {
    setSelected(value); // Salva o número selecionado para feedback visual

    // Verifica se a resposta está correta
    if (value === correct) {
      // Se acertou, incrementa a contagem de respostas corretas
      // Usamos uma função no setState para garantir que estamos usando o valor mais recente
      const newScore = correctAnswersCount + 1;
      setCorrectAnswersCount(newScore);

      // Após 1 segundo de feedback visual...
      setTimeout(() => {
        // Verifica se o jogador atingiu o número de vitórias necessárias
        if (newScore >= ROUNDS_TO_WIN) {
          // Se sim, marca o jogo como vencido!
          setIsGameWon(true);
        } else {
          // Se não, gera a próxima rodada do jogo
          generateGame();
        }
      }, 1000);
    } else {
      // Se errou, o progresso não avança.
      // Apenas esperamos o feedback visual e geramos a próxima rodada.
      setTimeout(() => {
        generateGame();
      }, 1500);
    }
  };

  // Função para reiniciar o jogo do zero
  const resetGame = () => {
    setCorrectAnswersCount(0);
    setIsGameWon(false);
    generateGame(); // Gera a primeira rodada novamente
  };

  // Função para lidar com a conclusão do jogo
  const handleGameCompletion = async () => {
    if (!gameId || !pathId) {
      Alert.alert("Erro", "Parâmetros ausentes.");
      router.back();
      return;
    }
    const current = Number(gameId);
    try {
      openNext(current);
    } catch (e) {
      openMap();
    }
  };

  // Tela de Sucesso
  if (isGameWon) {
    return (
      <WinScreen
        pathId={pathId}
        gameId={gameId}
        openMap={openMap}
        openNext={openNext}
        completeLevel={completeLevel}
        message="Você Conseguiu!"
        subtitle="Você contou todos os peixes!"
      />
    );
  }

  return (
    <View style={styles.gameContainer}>
      {/* Topo da tela com botões */}
      <View style={styles.header}>
        <BackButton onPress={() => (isGameWon ? router.replace("/home") : openMap())} />
        <TouchableOpacity style={styles.soundButton}>
          <Image source={soundIcon} style={styles.soundIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Título da pergunta */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>QUAL A QUANTIDADE DE PEIXES?</Text>
      </View>

      {/* Área onde os peixes aparecem */}
      <View style={{ width: windowWidth, height: containerHeight }}>
        {fishesData.map((fishData) => (
          <Fish
            key={fishData.id} // Usa a chave única
            source={fishData.source}
            initialPosition={fishData.initialPosition}
            size={fishData.size}
            containerWidth={windowWidth}
            containerHeight={containerHeight}
          />
        ))}
      </View>

      {/* Container para as bolhas de opção */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selected === option.value;
          const isCorrect = option.value === correct;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(option.value)}
              disabled={selected !== null} // Desabilita outras bolhas após uma resposta
            >
              <View
                style={[
                  styles.bubbleWrapper,
                  { transform: [{ translateY: option.verticalOffset }] },
                ]}
              >
                {/* A sombra agora fica por baixo da bolha */}
                <ImageBackground
                  source={require("../assets/images/bolha.png")}
                  style={styles.bubbleImageBackground}
                >
                  {/* Overlay para feedback visual */}
                  {selected !== null && isSelected && (
                    <View
                      style={[
                        styles.feedbackOverlay,
                        isCorrect ? styles.correctOverlay : styles.wrongOverlay,
                      ]}
                    />
                  )}
                  <Text style={[styles.bubbleText, { color: option.color }]}>
                    {option.value}
                  </Text>
                </ImageBackground>
                <Image
                  source={require("../assets/images/sombra.png")}
                  style={styles.shadowImage}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ProgressBar
        step={correctAnswersCount}
        totalSteps={ROUNDS_TO_WIN}
        style={{ marginBottom: verticalScale(20) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    // Container principal do jogo
    flex: 1,
    backgroundColor: "#fff8b8", // Fundo amarelo claro
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 10,
    marginTop: 20, // Ajuste para SafeArea se necessário
  },
  soundButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 50, // Círculo perfeito
  },
  soundIcon: {
    width: 43,
    height: 35,
  },
  questionContainer: {
    paddingTop: 5,
    marginVertical: 15,
  },
  questionText: {
    textTransform: "uppercase",
    color: "#f453b6", // Rosa
    fontFamily: "TTMilksCasualPie",
    fontSize: 30,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end", // Alinha as bolhas pela base
    width: "100%",
    paddingBottom: verticalScale(40), // Espaço na base
    // paddingHorizontal: 10,
    // marginBottom: "20%",
    marginVertical: 20,
  },
  // --- NOVOS ESTILOS PARA AS BOLHAS ---
  bubbleWrapper: {
    // Novo wrapper para cada bolha e sua sombra
    alignItems: "center",
  },
  bubbleImageBackground: {
    // Para a imagem da bolha
    width: scale(100), // Tamanho da bolha escalável
    height: scale(100),
    justifyContent: "center", // Centraliza o texto perfeitamente
    alignItems: "center",
  },
  shadowImage: {
    width: scale(80),
    height: verticalScale(25),
    resizeMode: "contain",
    opacity: 0.7, // Leve transparência para a sombra
  },
  bubbleText: {
    fontSize: moderateScale(40, 0.5), // Tamanho escalável para o número
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
  },
  feedbackOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: scale(50), // Círculo perfeito
    zIndex: 1,
  },
  correctOverlay: {
    backgroundColor: "rgba(22, 214, 22, 0.5)", // Verde semi-transparente
  },
  wrongOverlay: {
    backgroundColor: "rgba(255, 93, 93, 0.5)", // Vermelho semi-transparente
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#62bfec", // Um fundo azul de comemoração
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
  },
  successTitle: {
    fontSize: 36,
    fontFamily: "TTMilksCasualPie",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  successImage: {
    width: windowWidth,
    height: windowWidth,
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    fontFamily: "TTMilksCasualPie",
  },
  successButton: {
    backgroundColor: "#ff4da6", // Rosa
    paddingVertical: 15,
    // paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 15,
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
  },
  successButtonSecondary: {
    backgroundColor: "transparent",
    borderColor: "#9d59ff",
    borderWidth: 2,
    paddingVertical: 15,
    // paddingHorizontal: 40,
    borderRadius: 30,
    width: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  successButtonTextSecondary: {
    color: "#9d59ff",
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
  },
});
