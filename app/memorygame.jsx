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
import ConfettiCannon from "react-native-confetti-cannon";
import { useLevelNavigation } from "../hooks/useLevelNavigation";

import GameHeader from "@/components/gameheader"; // Agora default import
import ProgressBar from "@/components/progressbar";
import { Image, ImageBackground } from "expo-image";

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

export default function MemoryGame() {
  // Hooks de parâmetros e navegação
  const { pathId, gameId } = useLocalSearchParams();
  const { openMap } = useLevelNavigation(pathId);

  // Estados do jogo
  const [deck, setDeck] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Interceptar botão físico de voltar
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isGameWon) {
          router.replace("/home");
        } else {
          openMap();
        }
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [isGameWon, openMap])
  );

  // Criar deck embaralhado
  const createDeck = () => {
    const duplicatedCards = [...cards, ...cards];
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

  // Verificar vitória
  useEffect(() => {
    if (matchedCards.length === cards.length * 2 && matchedCards.length > 0) {
      setIsGameWon(true);
    }
  }, [matchedCards]);

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
        }, 1000);
      } else {
        // Não é par
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1500);
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
  };

  // Renderizar carta
  const renderCard = ({ item }) => {
    const isFlipped = flippedCards.includes(item.uniqueId);
    const isMatched = matchedCards.includes(item.uniqueId);
    const showFront = isFlipped || isMatched;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          !showFront ? { backgroundColor: "#fff7ed" } : { backgroundColor: item.color },
          isMatched && styles.matchedCard,
        ]}
        onPress={() => flipCard(item.uniqueId)}
        disabled={isChecking || isMatched || isFlipped}
      >
        {showFront ? (
          <Image
            source={item.image}
            style={{ height: "100%", width: "100%" }}
            contentFit="contain"
          />
        ) : (
          // <Text style={styles.cardText}>{item.name}</Text>
          <Image source={cardcoverImg} style={styles.cardBack} />
        )}
      </TouchableOpacity>
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
          {/* <Text style={styles.title}>JOGO DA MEMÓRIA</Text> */}

          <Text style={styles.scoreText}>acertos: {score}/6</Text>

          <FlatList
            data={deck}
            renderItem={renderCard}
            keyExtractor={(item) => item.uniqueId}
            numColumns={3}
            contentContainerStyle={styles.grid}
            scrollEnabled={false}
          />

          <TouchableOpacity style={styles.newGameButton} onPress={newGame}>
            <Text style={styles.newGameText}>🔄 NOVO JOGO</Text>
          </TouchableOpacity>

          <ProgressBar step={score} totalSteps={6} style={styles.progressBar} />
        </View>

        {isGameWon && (
          <View style={styles.winContainer}>
            <ConfettiCannon count={100} origin={{ x: -10, y: 0 }} />
            <Text style={styles.winText}>🎉 VOCÊ GANHOU! 🎉</Text>
          </View>
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
    paddingHorizontal: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreText: {
    fontSize: 30,
    fontFamily: "TTMilksCasualPie",
    color: "#fef294",
    marginBottom: 20,
  },
  grid: {
    flex: 1, // Adicionar flex
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 105,
    height: 105,
    margin: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    boxShadow: "5px 5px 1px rgba(0, 0, 0, 0.2)",
    padding: 10,
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
  cardBack: {
    width: 60,
    height: 70,
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
    marginTop: 20,
    marginBottom: 20,
  },
  winContainer: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    alignItems: "center",
  },
  winText: {
    fontSize: 24,
    fontFamily: "TTMilksCasualPie",
    color: "#27AE60",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
});
