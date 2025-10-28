import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import GameHeader from "../components/gameheader";
import WinScreen from "../components/winscreen";
import { GAME_DIFFICULTY_CONFIG } from "../constants/gameConfig";
import { useGameProgress } from "../context/GameContext";
import { useLevelNavigation } from "../hooks/useLevelNavigation";
import { logger } from "../utils/logger";

const backgroundImg = require("../assets/images/bg_1.png");
const { width, height } = Dimensions.get("window");

// Banco de palavras organizado por dificuldade (usando imagens temporárias existentes)
const WORD_BANK = {
  2: [
    { word: "OI", image: require("../assets/images/words/oi.png") },
    { word: "VÓ", image: require("../assets/images/words/vo.webp") },
    { word: "RÃ", image: require("../assets/images/words/ra.webp") },
    { word: "PÉ", image: require("../assets/images/words/pe.webp") },
  ],
  3: [
    { word: "OVO", image: require("../assets/images/words/ovo.png") },
    { word: "SOL", image: require("../assets/images/words/sol.webp") },
    { word: "CÃO", image: require("../assets/images/words/cao.png") },
    { word: "PÃO", image: require("../assets/images/words/pao.webp") },
    { word: "MÃO", image: require("../assets/images/words/mao.png") },
  ],
  4: [
    { word: "BOLA", image: require("../assets/images/words/bola.png") },
    { word: "CASA", image: require("../assets/images/words/casa.webp") },
    { word: "LUPA", image: require("../assets/images/words/lupa.webp") },
    { word: "PATO", image: require("../assets/images/words/pato.webp") },
    { word: "MESA", image: require("../assets/images/words/mesa.png") },
  ],
  5: [
    { word: "BALÃO", image: require("../assets/images/words/balao.webp") },
    { word: "CARRO", image: require("../assets/images/words/carro.png") },
    { word: "HOMEM", image: require("../assets/images/words/homem.webp") },
    { word: "PEIXE", image: require("../assets/images/words/peixe.png") },
    { word: "CHUVA", image: require("../assets/images/words/chuva.webp") },
  ],
};

export default function WordGame() {
  const params = useLocalSearchParams();
  const { pathId, gameId } = params;
  const difficulty = params.difficulty || "facil";
  const config = GAME_DIFFICULTY_CONFIG.word[difficulty];
  const { openMap, openNext, completeLevel, onWinMarkOnly } = useLevelNavigation(pathId);
  const { completeGame, isCompletingGame } = useGameProgress();
  const markedRef = useRef(false);

  const [currentWord, setCurrentWord] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [isWrongWord, setIsWrongWord] = useState(false);
  const [isCorrectWord, setIsCorrectWord] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);

  // Função para embaralhar array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Inicializar jogo
  useEffect(() => {
    const wordLength = config.wordLength;
    const wordsOfLength = WORD_BANK[wordLength] || [];

    if (wordsOfLength.length > 0) {
      // Selecionar palavra aleatória
      const randomWord = wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
      setCurrentWord(randomWord);

      // Criar letras da palavra
      const wordLetters = randomWord.word.split("").map((letter, index) => ({
        id: `word_${index}`,
        letter: letter,
        isWordLetter: true,
      }));

      // Gerar letras distratoras (não da palavra) - quantidade limitada como no design
      const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const wordLettersOnly = randomWord.word.split("");
      const availableDistractors = allLetters.filter(
        (letter) => !wordLettersOnly.includes(letter)
      );

      // Adicionar apenas algumas letras distratoras para não ficar muito difícil
      const numDistractors = wordLength <= 3 ? 1 : 2; // 1 distrator para palavras pequenas, 2 para maiores
      const distractorLetters = shuffleArray(availableDistractors)
        .slice(0, numDistractors)
        .map((letter, index) => ({
          id: `distractor_${index}`,
          letter: letter,
          isWordLetter: false,
        }));

      // Combinar e embaralhar todas as letras
      const allAvailableLetters = shuffleArray([...wordLetters, ...distractorLetters]);
      setAvailableLetters(allAvailableLetters);
    }
  }, [config.wordLength]);

  // Função para o GameHeader
  const handleBackPress = () => {
    if (isGameWon) {
      router.replace("/home");
    } else {
      openMap();
    }
  };

  // Função para selecionar letra
  const handleLetterPress = (letterObj) => {
    // Não permitir seleção durante erro ou acerto
    if (isWrongWord || isCorrectWord) return;

    // Verificar se a letra já foi selecionada
    if (selectedLetters.find((l) => l.id === letterObj.id)) return;

    // Encontrar a próxima posição vazia nos slots
    const nextEmptyIndex = selectedLetters.length;
    if (nextEmptyIndex >= currentWord.word.length) return;

    // Criar array de letras com posições específicas
    const newSelected = [...selectedLetters];
    newSelected[nextEmptyIndex] = letterObj;
    setSelectedLetters(newSelected);

    // Verificar vitória ou erro quando todos os slots estão preenchidos
    if (newSelected.length === currentWord.word.length) {
      const formedWord = newSelected.map((l) => l.letter).join("");
      if (formedWord === currentWord.word) {
        // Palavra correta - mostrar feedback verde!
        setIsCorrectWord(true);
        setTimeout(() => {
          setIsGameWon(true);
        }, 1000); // Mais tempo para ver o feedback verde
      } else {
        // Palavra incorreta - mostrar erro e resetar
        setIsWrongWord(true);
        setShakeAnimation(true);

        // Feedback de erro por 1.5 segundos, depois limpa as letras
        setTimeout(() => {
          setSelectedLetters([]);
          setIsWrongWord(false);
        }, 1500);
      }
    }
  };

  // Função para remover letra selecionada
  const handleSelectedLetterPress = (index) => {
    // Não permitir remoção durante erro ou acerto
    if (isWrongWord || isCorrectWord) return;

    // Remover apenas a letra no índice específico e reorganizar
    const newSelected = [...selectedLetters];
    newSelected.splice(index, 1);
    setSelectedLetters(newSelected);
  };

  // Marcar nível como completo quando o jogo é ganho
  // useEffect para marcar como completo na vitória com Firebase sync
  useEffect(() => {
    if (isGameWon && !markedRef.current) {
      const gameIndex = Number(gameId);
      if (gameIndex && pathId) {
        const completeWithScore = async () => {
          try {
            const result = await completeGame(pathId, gameIndex, 1, {
              gameType: "word",
            });
          } catch (error) {
            logger.error("[WordGame] ❌ Erro ao completar jogo:", error);
            onWinMarkOnly(gameIndex);
          }
        };

        completeWithScore();
        markedRef.current = true;
      }
    }
  }, [isGameWon, gameId, pathId, completeGame, onWinMarkOnly]);

  // Animação de shake quando há erro
  useEffect(() => {
    if (shakeAnimation) {
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        setShakeAnimation(shakeCount % 2 === 0);
        shakeCount++;
        if (shakeCount >= 6) {
          clearInterval(shakeInterval);
          setShakeAnimation(false);
        }
      }, 100);

      return () => clearInterval(shakeInterval);
    }
  }, [shakeAnimation]);

  // Se não há palavra carregada ainda
  if (!currentWord) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  // Renderizar slots da palavra
  const renderWordSlots = () => {
    const slots = [];
    // Ajustar tamanho dos slots baseado no tamanho da palavra
    const wordLength = currentWord.word.length;
    const slotWidth = wordLength >= 5 ? scale(50) : scale(60); // Menor para 5+ letras
    const slotMargin = wordLength >= 5 ? scale(6) : scale(8); // Menor espaçamento para 5+ letras

    for (let i = 0; i < currentWord.word.length; i++) {
      const selectedLetter = selectedLetters[i];
      slots.push(
        <TouchableOpacity
          key={i}
          onPress={() => selectedLetter && handleSelectedLetterPress(i)}
          style={{
            width: slotWidth,
            height: verticalScale(8),
            backgroundColor: isCorrectWord
              ? "#00AA00"
              : isWrongWord
                ? "#FF4444"
                : "#4A9EFF", // Verde quando correto, vermelho quando erro
            borderRadius: scale(4),
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: slotMargin,
          }}
        >
          {/* Linha azul como mostrado nas imagens */}
        </TouchableOpacity>
      );
    }
    return slots;
  };

  // Renderizar letras disponíveis
  const renderAvailableLetters = () => {
    // Ajustar tamanho baseado no número total de letras
    const totalLetters = availableLetters.length;
    const wordLength = currentWord.word.length;

    // Três tamanhos: normal (até 3 letras), médio (4 letras), pequeno (5+ letras)
    let letterWidth, letterHeight, fontSize, marginHorizontal, marginVertical;

    if (wordLength >= 5) {
      // Tamanho pequeno para palavras de 5+ letras
      letterWidth = scale(75);
      letterHeight = verticalScale(75);
      fontSize = moderateScale(42);
      marginHorizontal = scale(6);
      marginVertical = verticalScale(3);
    } else if (totalLetters >= 6) {
      // Tamanho médio para palavras de 4 letras
      letterWidth = scale(85);
      letterHeight = verticalScale(85);
      fontSize = moderateScale(50);
      marginHorizontal = scale(8);
      marginVertical = verticalScale(4);
    } else {
      // Tamanho normal para palavras de 2-3 letras
      letterWidth = scale(100);
      letterHeight = verticalScale(100);
      fontSize = moderateScale(60);
      marginHorizontal = scale(10);
      marginVertical = verticalScale(5);
    }

    return availableLetters.map((letterObj) => {
      const isUsed = selectedLetters.find((l) => l.id === letterObj.id);

      return (
        <TouchableOpacity
          key={letterObj.id}
          onPress={() => !isUsed && handleLetterPress(letterObj)}
          style={{
            width: letterWidth,
            height: letterHeight,
            backgroundColor: isUsed ? "#E0E0E0" : "#FFFFFF",
            borderRadius: scale(20),
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: marginHorizontal,
            marginVertical: marginVertical,
            opacity: isUsed ? 0.3 : 1,
            // Sombra sutil
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: fontSize,
              fontFamily: "TTMilksCasualPie",
              color: "#E856A6",
            }}
          >
            {letterObj.letter}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg_third_tall.png")}
      style={{ flex: 1, backgroundColor: "#FF9BB5" }}
    >
      {/* Fundo rosa sólido como nas imagens */}
      <View style={{ flex: 1 }}>
        <GameHeader onBackPress={handleBackPress} />

        {/* Título */}
        <Text
          style={{
            color: isCorrectWord ? "#00AA00" : isWrongWord ? "#FF4444" : "#FEF294",
            fontSize: moderateScale(28),
            fontFamily: "TTMilksCasualPie",
            textAlign: "center",
            marginTop: verticalScale(20),
            marginBottom: verticalScale(30),
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {isCorrectWord
            ? "PALAVRA CORRETA!"
            : isWrongWord
              ? "PALAVRA INCORRETA!"
              : "MONTE A PALAVRA:"}
        </Text>

        {/* Imagem da palavra */}
        <View style={{ alignItems: "center", marginBottom: verticalScale(30) }}>
          <Image
            source={currentWord.image}
            style={{
              width: scale(150),
              height: verticalScale(150),
            }}
            contentFit="contain"
          />
        </View>

        {/* Área da palavra com letras selecionadas e slots */}
        <View
          style={{
            alignItems: "center",
            marginBottom: verticalScale(40),
          }}
        >
          {/* Letras selecionadas */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: verticalScale(10),
              minHeight: verticalScale(50),
              // Efeito de shake quando há erro
              transform: shakeAnimation ? [{ translateX: 10 }] : [{ translateX: 0 }],
            }}
          >
            {Array.from({ length: currentWord.word.length }).map((_, index) => {
              // Renderizar todos os slots, com ou sem letras
              const letterObj = selectedLetters[index];
              const wordLength = currentWord.word.length;
              const letterWidth = wordLength >= 5 ? scale(50) : scale(60);
              const fontSize = wordLength >= 5 ? moderateScale(30) : moderateScale(36);
              const marginHorizontal = wordLength >= 5 ? scale(6) : scale(8);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => letterObj && handleSelectedLetterPress(index)}
                  style={{
                    width: letterWidth,
                    height: verticalScale(50),
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: marginHorizontal,
                  }}
                >
                  {letterObj && (
                    <Text
                      style={{
                        fontSize: fontSize,
                        fontFamily: "TTMilksCasualPie",
                        color: isCorrectWord
                          ? "#00AA00"
                          : isWrongWord
                            ? "#FF4444"
                            : "#FFFFFF", // Verde quando correto, vermelho quando erro
                        textShadowColor: "rgba(0,0,0,0.3)",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      {letterObj.letter}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Slots da palavra (linhas azuis) */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {renderWordSlots()}
          </View>
        </View>

        {/* Letras disponíveis em grade */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: scale(15),
            marginBottom: verticalScale(40),
            // Largura ajustada baseada no tamanho da palavra
            maxWidth:
              currentWord.word.length >= 5
                ? scale(320)
                : availableLetters.length >= 6
                  ? scale(350)
                  : scale(400),
            alignSelf: "center",
          }}
        >
          {renderAvailableLetters()}
        </View>

        {isGameWon && (
          <WinScreen
            pathId={pathId}
            gameId={gameId}
            openMap={openMap}
            openNext={openNext}
            completeLevel={completeLevel}
            message="Parabéns!"
            subtitle={`Você montou a palavra "${currentWord.word}" corretamente!`}
            isLoading={isCompletingGame}
          />
        )}
      </View>
    </ImageBackground>
  );
}
