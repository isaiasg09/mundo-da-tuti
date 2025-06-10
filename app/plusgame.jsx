import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  TouchableWithoutFeedback,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

// Importações para a lógica de jogo
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGameProgress } from "@/context/GameContext"; // Importa o contexto do jogo
import { CASTLE_PATH_GAMES } from "@/constants/paths"; // Importa a lista de jogos do caminho
import { GAME_DIFFICULTY_CONFIG } from "@/constants/gameConfig"; // Importa nossa configuração
import BackButton from "@/components/backbutton";
import ProgressBar from "@/components/progressbar"; // Importe sua ProgressBar
import ConfettiCannon from "react-native-confetti-cannon"; // Para a tela de sucesso

const TOTAL_ROUNDS = 5;

export default function PlusGame() {
  const router = useRouter();
  const { gameProgress, setGameProgress } = useGameProgress();
  const confettiRef = useRef(null);
  const {
    pathId,
    gameId,
    contextKey,
    difficulty = "facil", // Pega o parâmetro de dificuldade da rota. Se nenhum for passado, ele assume 'facil' como padrão.
    gameType = "soma", // Pega o parâmetro de tipo de jogo da rota. Se nenhum for passado, ele assume 'soma' como padrão.
  } = useLocalSearchParams();

  // Pega as configurações para a dificuldade atual
  const config = GAME_DIFFICULTY_CONFIG[gameType][difficulty];

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [bubbleData, setBubbleData] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Para feedback visual

  // Estados de Progressão
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);

  // Efeito para iniciar o jogo e disparar confetes na vitória
  useEffect(() => {
    generateNewQuestion();
  }, []);

  // Efeito para verificar se o jogo foi ganho e disparar os confetes com delayzinho de 100ms
  useEffect(() => {
    if (isGameWon && confettiRef.current) {
      setTimeout(() => confettiRef.current.start(), 100);
    }
  }, [isGameWon]);

  // Lógica para gerar uma nova questão
  const generateNewQuestion = () => {
    setSelectedAnswer(null); // Limpa o feedback da rodada anterior

    // --- USA A CONFIGURAÇÃO DE DIFICULDADE AQUI ---
    const newNum1 = Math.floor(Math.random() * config.maxNumber) + 1;
    const newNum2 = Math.floor(Math.random() * config.maxNumber) + 1;
    const correct = newNum1 + newNum2;

    let options = [correct];
    while (options.length < 3) {
      // Usa o 'optionsRange' da configuração para gerar opções erradas mais difíceis
      const wrong = Math.floor(Math.random() * config.optionsRange) + 2;
      // Garante que a opção errada não seja igual à correta e seja positiva
      if (!options.includes(wrong) && wrong > 0) {
        // Adiciona a opção errada ao array de opções
        options.push(wrong);
      }
    }

    const shuffledOptions = options.sort(() => 0.5 - Math.random());
    const colors = ["#f453b6", "#62bfec", "#cb6ce6"];
    const shuffledColors = colors.sort(() => 0.5 - Math.random());

    const data = shuffledOptions.map((value, index) => ({
      value,
      color: shuffledColors[index],
      offset: Math.floor(Math.random() * 41) - 20,
    }));

    setNum1(newNum1);
    setNum2(newNum2);
    setBubbleData(data);
  };

  // Lógica para quando uma resposta é pressionada
  const handlePress = (value) => {
    if (selectedAnswer !== null) return; // Impede múltiplos cliques

    const correct = num1 + num2;
    setSelectedAnswer(value); // Define a resposta selecionada para dar feedback visual

    if (Number(value) === correct) {
      // Se a resposta está CORRETA
      const newScore = correctAnswersCount + 1;
      setCorrectAnswersCount(newScore);

      setTimeout(() => {
        if (newScore >= TOTAL_ROUNDS) {
          setIsGameWon(true); // Venceu o jogo!
        } else {
          generateNewQuestion(); // Próxima rodada
        }
      }, 1000); // Atraso de 1 segundo para o jogador ver o feedback
    } else {
      // Se a resposta está ERRADA, apenas mostra o feedback por um tempo e depois reseta
      setTimeout(() => {
        setSelectedAnswer(null); // Limpa o feedback de "errado" para o jogador tentar de novo
      }, 1000);
    }
  };

  // Lógica para salvar progresso e navegar após vencer
  const handleGameCompletion = () => {
    const currentGameIndex = CASTLE_PATH_GAMES.findIndex(
      (game) => game.id === Number(gameId)
    );
    if (currentGameIndex === -1) {
      Alert.alert("Erro", "Não foi possível salvar o progresso.");
      router.replace({ pathname: "/firstpath", params: { pathId } });
      return;
    }
    const progressUpdate = {
      paths: { [pathId]: { games: { [contextKey]: { status: "completed" } } } },
    };
    const nextGame = CASTLE_PATH_GAMES[currentGameIndex + 1];

    if (nextGame) {
      const nextGameContextKey = `game${currentGameIndex + 2}`;
      progressUpdate.paths[pathId].games[nextGameContextKey] = {
        status: "unlocked",
      };
    } else {
      progressUpdate.paths[pathId].status = "completed";
      progressUpdate.paths.molusco_perola = { status: "unlocked" };
    }
    setGameProgress(progressUpdate);

    // 8. Navega o jogador de volta para a tela do mapa do caminho.
    console.log("Jogo concluído. Voltando para o mapa do caminho...");
    router.back();
  };

  // Renderiza a tela de sucesso se o jogo foi vencido
  if (isGameWon) {
    return (
      <View style={successStyles.container}>
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
        />
        <Text style={successStyles.title}>Parabéns!</Text>
        <TouchableWithoutFeedback onPress={() => confettiRef.current.start()}>
          <Image
            source={require("../assets/images/tuti_festa.png")}
            style={successStyles.image}
            resizeMode="contain"
          />
        </TouchableWithoutFeedback>

        <TouchableOpacity
          style={successStyles.button}
          onPress={handleGameCompletion}
        >
          <Text style={successStyles.buttonText}>Voltar ao Mapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* view pra deixar o titulo mais pra cima por causa do space-between do container */}
      <View>
        {/* Top icons */}
        <View style={styles.topBar}>
          <BackButton />
          <Image
            source={require("../assets/images/icons/sound_icon.png")}
            style={styles.icon}
          />
        </View>
        {/* Title */}
        <Text style={styles.title}>QUAL O RESULTADO DA SOMA?</Text>
      </View>

      {/* Tartarugas */}
      <View style={styles.turtlesRow}>
        <View style={styles.turtleContainer}>
          <Image
            source={require("../assets/images/poses_tuti/tuti_numero.png")}
            style={styles.turtle}
          />
          <View style={styles.labelBox}>
            <Text style={styles.labelText}>{num1}</Text>
          </View>
        </View>

        <Image
          source={require("../assets/images/icons/mais.png")}
          style={styles.plus}
        />

        <View style={styles.turtleContainer}>
          <Image
            source={require("../assets/images/poses_tuti/tuti_numero.png")}
            style={styles.turtle}
          />
          <View style={styles.labelBox}>
            <Text style={styles.labelText}>{num2}</Text>
          </View>
        </View>
      </View>

      {/* Bolhas com opções */}
      <View style={styles.bubblesRow}>
        {bubbleData.map((bubble, index) => {
          const isSelected = selectedAnswer === bubble.value;
          const isCorrect = bubble.value === num1 + num2;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(bubble.value)}
              disabled={selectedAnswer !== null} // Desabilita outras bolhas após uma resposta
            >
              <View
                style={[
                  styles.bubbleWrapper,
                  { transform: [{ translateY: bubble.offset }] },
                ]}
              >
                {/* A sombra agora fica por baixo da bolha */}
                <ImageBackground
                  source={require("../assets/images/bolha.png")}
                  style={styles.bubbleImageBackground}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      bubble.value >= 10
                        ? styles.doubleDigit
                        : styles.singleDigit,
                      { color: bubble.color },
                    ]}
                  >
                    {bubble.value}
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

      {/* Barra de Progresso */}
      <ProgressBar
        step={correctAnswersCount}
        totalSteps={TOTAL_ROUNDS}
        style={{ marginBottom: verticalScale(20) }} // Espaçamento inferior
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Estilos do Container Principal ---
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(20),
    paddingHorizontal: scale(20),
    alignItems: "center",
    justifyContent: "space-between", // Distribui o espaço entre topo, meio e base
    backgroundColor: "#ffe8ac", // Cor de fundo
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: scale(50), // Tamanho escalável
    height: scale(50),
    resizeMode: "contain",
  },
  // --- Estilos de Texto ---
  title: {
    fontFamily: "TTMilksCasualPie",
    fontSize: moderateScale(30, 0.5), // Fonte escalável
    color: "#EC46C6",
    textAlign: "center",
    marginVertical: verticalScale(15),
  },
  labelText: {
    fontFamily: "TTMilksCasualPie",
    fontSize: moderateScale(45, 0.5),
    color: "#476bb4",
  },
  // --- Estilos do Jogo (Tartarugas e Soma) ---
  turtlesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distribui as tartarugas uniformemente
    // gap: scale(10), // Espaço escalável
    width: "100%", // Garante que ocupe toda a largura
  },
  turtleContainer: {
    alignItems: "center",
  },
  turtle: {
    width: scale(130), // Largura escalável
    height: verticalScale(150), // Altura escalável
    resizeMode: "contain",
  },
  labelBox: {
    position: "absolute",
    top: verticalScale(20), // Posição escalável
    width: scale(70),
    height: verticalScale(55),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    width: scale(40),
    height: scale(40),
    // marginHorizontal: scale(10),
  },
  // --- Estilos das Bolhas de Resposta ---
  bubblesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end", // Alinha as bolhas pela base
    width: "100%",
    paddingBottom: verticalScale(40), // Espaço na base
  },
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
    // marginTop: verticalScale(-10), // Leve sobreposição da sombra pela bolha
    // backgroundColor: "red",
  },
  bubbleText: {
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    // Posição e tamanho agora são mais simples
  },
  singleDigit: {
    // Para números com 1 dígito
    fontSize: moderateScale(50, 0.5),
  },
  doubleDigit: {
    // Para números com 2 dígitos
    fontSize: moderateScale(45, 0.5),
  },
});

// ESTILOS DE SUCESSO (podem ir para um arquivo separado ou ficar aqui)
const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#62bfec",
  },
  title: {
    fontSize: moderateScale(40),
    color: "#fff",
    fontFamily: "TTMilksCasualPie",
    fontWeight: "bold",
    marginBottom: verticalScale(20),
  },
  image: {
    width: scale(250),
    height: scale(250),
    marginBottom: verticalScale(30),
  },
  button: {
    backgroundColor: "#ff4da6",
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(40),
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
});
