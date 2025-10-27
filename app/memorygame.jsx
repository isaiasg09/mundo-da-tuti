import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";

import { GAME_DIFFICULTY_CONFIG } from "../constants/gameConfig";
import { useGameProgress } from "../context/GameContext";
import { useLevelNavigation } from "../hooks/useLevelNavigation";
import { logger } from "../utils/logger";

import { Image, ImageBackground } from "expo-image";
import GameHeader from "../components/gameheader";
import ProgressBar from "../components/progressbar";
import WinScreen from "../components/winscreen";

// Assets
const peixeImg = require("../assets/images/cards/peixe.webp");
const baleiaImg = require("../assets/images/cards/baleia.webp");
const baiacuImg = require("../assets/images/cards/baiacu.webp");
const tartarugaImg = require("../assets/images/cards/tartaruga.webp");
const caranguejoImg = require("../assets/images/cards/caranguejo.webp");
const tubaraoImg = require("../assets/images/cards/tubarao.svg");
const backgroundImg = require("../assets/images/bg_second_tall.png");
const cardcoverImg = require("../assets/images/cards/mundo_cover.png");

const cards = [
  { id: 1, image: peixeImg, name: "peixe", color: "#aafffd" },
  { id: 2, image: baleiaImg, name: "baleia", color: "#fef294" },
  { id: 3, image: baiacuImg, name: "baiacu", color: "#ff83d0" },
  { id: 4, image: tartarugaImg, name: "tartaruga", color: "#ffe6f6" },
  { id: 5, image: caranguejoImg, name: "caranguejo", color: "#94ffb8" },
  { id: 6, image: tubaraoImg, name: "tubarão", color: "#81b3ff" },
];

const { width, height } = Dimensions.get("window");

const AnimatedCard = ({ item, isFlipped, isMatched, onFlip, disabled, cardSize }) => {
  const flipValue = useSharedValue(0);

  const [showFront, setShowFront] = useState(false);

  // Animar quando isFlipped ou isMatched muda
  useEffect(() => {
    if (isFlipped || isMatched) {
      // Virar para frente (mostrar imagem)
      flipValue.value = withTiming(180, { duration: 600 });
    } else {
      // Virar para trás (mostrar capa)
      flipValue.value = withTiming(0, { duration: 600 });
    }
  }, [isFlipped, isMatched]);

  // Estilo da frente da carta (capa)
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 90, 180], [0, -90, -180]);
    // const opacity = interpolate(flipValue.value, [0, 90, 180], [1, 0, 0]);

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      // opacity,
      backfaceVisibility: "hidden",
    };
  });

  // Estilo da parte de trás da carta (imagem)
  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 90, 180], [180, 90, 0]);
    // const opacity = interpolate(flipValue.value, [0, 90, 180], [0, 0, 1]);

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      // opacity,
      backfaceVisibility: "hidden",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  const cardColor = isMatched ? "#27AE60" : item.color;

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { width: cardSize, height: cardSize }]}
      onPress={onFlip}
      disabled={disabled}
    >
      {/* Sombra falsa preenchida */}
      <View style={[styles.fakeShadow, { width: cardSize, height: cardSize }]} />

      {/* Frente da carta (capa) */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: "#fff7ed", width: cardSize, height: cardSize },
          frontStyle,
        ]}
      >
        <Image source={cardcoverImg} style={styles.cardBack} contentFit="contain" />
      </Animated.View>

      {/* Verso da carta (imagem) */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: cardColor, width: cardSize, height: cardSize },
          backStyle,
        ]}
      >
        <Image source={item.image} style={styles.cardImage} contentFit="contain" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function MemoryGame() {
  // Hooks de parâmetros e navegação
  const {
    pathId,
    gameId,
    difficulty = "facil", // Pega o parâmetro de dificuldade da rota mas deixa o padrão como fácil
    gameType = "memory", // Pega o parâmetro de tipo de jogo da rota mas deixa o padrão como memória
  } = useLocalSearchParams();
  const { openMap, openNext, completeLevel, onWinMarkOnly } = useLevelNavigation(pathId);
  const { completeGame, isCompletingGame } = useGameProgress();
  const markedRef = useRef(false);

  // Pega as configurações para a dificuldade atual nas constantes
  const config = GAME_DIFFICULTY_CONFIG[gameType][difficulty];

  // console.log("MEMORY GAME DEBUG:", {
  //   pathId,
  //   gameId,
  //   difficulty,
  //   gameType,
  //   config: config || "CONFIG NÃO ENCONTRADO",
  // });

  // Calcular número de colunas baseado na dificuldade e espaço disponível
  const calculateColumns = () => {
    const totalCards = config.pairs * 2;
    const availableWidth = width - 40; // largura da tela - padding
    const minCardSize = 80; // tamanho mínimo desejável para as cartas
    const margin = 16; // margem total entre cartas

    // Calcular quantas colunas cabem confortavelmente
    const maxPossibleColumns = Math.floor(availableWidth / (minCardSize + margin));

    // Lógica baseada na dificuldade para o melhor layout
    let idealColumns;
    if (totalCards <= 6) {
      // Fácil: 6 cartas - 2 ou 3 colunas funcionam bem
      idealColumns = Math.min(maxPossibleColumns, 3);
    } else if (totalCards <= 8) {
      // Médio: 8 cartas - 2 colunas geralmente fica melhor (4x2)
      idealColumns = Math.min(maxPossibleColumns, 2);
    } else {
      // Difícil: 12 cartas - 3 colunas é ideal (4x3)
      idealColumns = Math.min(maxPossibleColumns, 3);
    }

    // console.log("Colunas calculadas:", idealColumns, "para", totalCards, "cartas");
    return idealColumns;
  };

  const numColumns = calculateColumns();

  // Calcular tamanho dinâmico das cartas
  const calculateCardSize = () => {
    const availableWidth = width - 40; // largura da tela - padding
    const totalMargin = 16 * numColumns; // margem total (8px de cada lado * 2 * numColumns)
    const cardWidth = Math.floor((availableWidth - totalMargin) / numColumns);

    // Garantir que não fique muito pequeno nem muito grande
    return Math.max(70, Math.min(cardWidth, 120));
  };

  const dynamicCardSize = calculateCardSize();

  // Estados do jogo:
  const [deck, setDeck] = useState([]); // Array embaralhado das cartas
  const [flippedCards, setFlippedCards] = useState([]); // uniqueIds das cartas viradas
  const [matchedCards, setMatchedCards] = useState([]); // uniqueIds das cartas combinadas
  const [score, setScore] = useState(0); // Número de pares encontrados
  const [isGameWon, setIsGameWon] = useState(false); // Indica se o jogo foi ganho
  const [isChecking, setIsChecking] = useState(false); // Previne múltiplas interações
  const [levelCompleted, setLevelCompleted] = useState(false); // Previne múltiplas conclusões

  // Interceptar botão físico de voltar
  useFocusEffect(
    // useCallback foi usado para memorizar a função e evitar loops infinitos
    React.useCallback(() => {
      // função pra lidar com o botão de voltar: se o jogo foi ganho, vai pra home; se não, abre o mapa
      const onBackPress = () => {
        if (isGameWon) {
          router.replace("/home");
        } else {
          openMap();
        }
        return true;
      };

      // Adiciona o listener para o botão de voltar no botão físico do celular
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [isGameWon, openMap])
  );

  // Criar deck embaralhado baseado na dificuldade
  const createDeck = () => {
    // Seleciona apenas o número de cartas necessárias baseado na configuração
    const selectedCards = cards.slice(0, config.pairs);
    const duplicatedCards = [...selectedCards, ...selectedCards];
    return duplicatedCards
      .map((card, index) => ({
        ...card,
        uniqueId: `${card.id}-${index}`,
      }))
      .sort(() => Math.random() - 0.5);
  };

  // Inicializar jogo
  useEffect(() => {
    setDeck(createDeck());
  }, []);

  // Verificar vitória baseada na configuração de dificuldade
  useEffect(() => {
    const totalCardsForDifficulty = config.pairs * 2;
    if (matchedCards.length === totalCardsForDifficulty && matchedCards.length > 0) {
      setIsGameWon(true);
    }
  }, [matchedCards, config.pairs]);

  // useEffect para marcar como completo na vitória com Firebase sync
  useEffect(() => {
    if (isGameWon && !markedRef.current) {
      const gameIndex = Number(gameId);
      if (gameIndex && pathId) {
        const completeWithScore = async () => {
          try {
            const result = await completeGame(pathId, gameIndex, matchedPairs, {
              gameType,
            });
          } catch (error) {
            logger.error("[MemoryGame] ❌ Erro ao completar jogo:", error);
            onWinMarkOnly(gameIndex);
          }
        };

        completeWithScore();
        markedRef.current = true;
      }
    }
  }, [isGameWon, gameId, pathId, completeGame, matchedPairs, onWinMarkOnly]);

  // Lógica de virar carta
  const flipCard = (uniqueId) => {
    if (
      isChecking ||
      flippedCards.includes(uniqueId) ||
      matchedCards.includes(uniqueId)
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, uniqueId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      const [first, second] = newFlippedCards;
      const firstCard = deck.find((card) => card.uniqueId === first);
      const secondCard = deck.find((card) => card.uniqueId === second);

      if (firstCard.id === secondCard.id) {
        // Par encontrado
        setTimeout(() => {
          setMatchedCards((prev) => [...prev, first, second]);
          setFlippedCards([]);
          setScore((prev) => prev + 1);
          setIsChecking(false);
        }, config.matchTime);
      } else {
        // Não é par
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, config.flipTime);
      }
    }
  };

  // Reiniciar jogo
  const newGame = () => {
    setDeck(createDeck());
    setFlippedCards([]);
    setMatchedCards([]);
    setScore(0);
    setIsGameWon(false);
    setIsChecking(false);
    setLevelCompleted(false); // Reset do estado de conclusão
  };

  // Renderizar carta
  const renderCard = ({ item }) => {
    const isFlipped = flippedCards.includes(item.uniqueId);
    const isMatched = matchedCards.includes(item.uniqueId);

    return (
      <AnimatedCard
        item={item}
        isFlipped={isFlipped}
        isMatched={isMatched}
        onFlip={() => flipCard(item.uniqueId)}
        disabled={isChecking || isMatched || isFlipped}
        cardSize={dynamicCardSize}
      />
    );
  };

  // Função para o GameHeader
  const handleBackPress = () => {
    if (isGameWon) {
      router.replace("/home");
    } else {
      openMap();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImg}
        style={styles.backgroundImage}
        // contentFit="cover"
        // contentPosition="center"
      >
        <GameHeader onBackPress={handleBackPress} />

        <View style={styles.gameArea}>
          <Text style={styles.scoreText}>
            acertos: {score}/{config.pairs}
          </Text>

          <View style={styles.gameContainer}>
            <FlatList
              key={`${difficulty}-${numColumns}`} // Força re-render quando muda dificuldade/colunas
              data={deck}
              renderItem={renderCard}
              keyExtractor={(item) => item.uniqueId}
              numColumns={numColumns}
              contentContainerStyle={styles.grid}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.newGameButton} onPress={newGame}>
              <Text style={styles.newGameText}>NOVO JOGO</Text>
            </TouchableOpacity>

            <ProgressBar
              step={score}
              totalSteps={config.pairs}
              style={styles.progressBar}
            />
          </View>
        </View>

        {isGameWon && (
          <WinScreen
            pathId={pathId}
            gameId={gameId}
            openMap={openMap}
            openNext={openNext}
            completeLevel={completeLevel}
            message="Você ganhou!"
            subtitle="Você combinou todos os pares e completou o jogo de memória!"
            isLoading={isCompletingGame}
          />
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  scoreText: {
    fontSize: 30,
    fontFamily: "TTMilksCasualPie",
    color: "#fef294",
    marginBottom: 15,
  },
  grid: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  gameContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: verticalScale(20),
  },
  cardContainer: {
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Importante para absolute positioning
    borderRadius: 12,
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 10,
    zIndex: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardBack: {
    width: scale(60),
    height: 70,
  },
  // bloco opaco que vai se comportar como sombra
  fakeShadow: {
    position: "absolute",
    top: 5, // distancia do topo
    left: 5, // distancia da esquerda
    borderRadius: 12,
    backgroundColor: "#000000",
    opacity: 0.25, // Ajuste para o efeito desejado
    zIndex: -1,
  },
  matchedCard: {
    backgroundColor: "#27AE60",
  },
  cardText: {
    fontSize: 12,
    fontFamily: "TTMilksCasualPie",
    color: "#FFFFFF",
    textAlign: "center",
  },
  newGameButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  newGameText: {
    fontSize: 18,
    fontFamily: "TTMilksCasualPie",
    color: "#FFFFFF",
    textAlign: "center",
  },
  progressBar: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
});
