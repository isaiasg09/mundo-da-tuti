import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Importa hook de progresso do jogo
import { useGameProgress } from "@/context/GameContext";

import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";

const LEVEL_STATES = {
  COMPLETED: "completed",
  UNLOCKED: "unlocked",
  LOCKED: "locked",
};

import { CASTLE_PATH_GAMES } from "@/constants/paths";

// posições absolutas das conchas
const levelPositions = [
  { id: 1, x: 175, state: LEVEL_STATES.UNLOCKED },
  { id: 2, x: 70, state: LEVEL_STATES.LOCKED },
  { id: 3, x: 260, state: LEVEL_STATES.LOCKED },
  { id: 4, x: 310, state: LEVEL_STATES.LOCKED },
  { id: 5, x: 140, state: LEVEL_STATES.LOCKED },
  { id: 6, x: 250, state: LEVEL_STATES.LOCKED },
];

// Gera os níveis com base nos X definidos e Y decrescente (de baixo pra cima)
// const createLevels = () => {
//   const baseY = 550;
//   const stepY = 100;

//   return levelPositions.map((item, index) => ({
//     ...item,
//     y: baseY - index * stepY,
//   }));
// };

// const levels = createLevels();

// Cores dos níveis
const stateColors = {
  [LEVEL_STATES.COMPLETED]: "#4CAF50",
  [LEVEL_STATES.UNLOCKED]: "#ff3b3b",
  [LEVEL_STATES.LOCKED]: "#BDBDBD",
};

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

const createSharedScales = (count) => {
  return Array.from({ length: count }, () => useSharedValue(1));
};

// --- NOVA FUNÇÃO PARA PRÉ-CARREGAR OS JOGOS ---
// Esta função mapeia uma rota para sua importação dinâmica explícita.
const preloadGameModule = async (route) => {
  console.log(`Tentando pré-carregar o módulo para a rota: ${route}`);
  switch (route) {
    case "/fishgame":
      // O caminho aqui deve ser relativo a ESTE arquivo (shellpathmap.jsx)
      // Se seu app está em /app e este componente em /components, o caminho é '../app/fishgame'
      return await import("../app/fishgame");

    // case "/MemoryGame":
    //   return await import("../app/memorygame"); // Substitua pelo caminho real do seu jogo da memória

    // case "/PuzzleGame":
    //   return await import("../app/puzzlegame"); // Substitua pelo caminho real do seu quebra-cabeça

    // --- ADICIONE OS OUTROS JOGOS AQUI ---
    // case '/Game4':
    //   return await import('../app/game4');
    // case '/Game5':
    //   return await import('../app/game5');
    // case '/Game6':
    //   return await import('../app/game6');

    default:
      // Se a rota não for encontrada, apenas loga um aviso e não quebra o app
      console.warn(
        `Nenhum caminho de pré-carregamento configurado para a rota: ${route}`
      );
      return Promise.resolve(); // Retorna uma promessa resolvida para não gerar um erro
  }
};

export default function ShellPathMap({ pathId }) {
  const shellImages = [
    require("../assets/images/shells/shell1.png"),
    require("../assets/images/shells/shell2.png"),
    require("../assets/images/shells/shell3.png"),
    require("../assets/images/shells/shell4.png"),
    require("../assets/images/shells/shell5.png"),
  ];
  const brilhoImg = require("../assets/images/brilho.png");

  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = async () => {};

  const { gameProgress } = useGameProgress();
  // console.log("LOG EM ShellPathMap: Prop 'pathId' recebida:", pathId);
  // console.log(
  //   "LOG EM ShellPathMap: Conteúdo do GameContext:",
  //   JSON.stringify(gameProgress, null, 2)
  // );

  // --- LÓGICA DINÂMICA PARA CRIAR OS NÍVEIS ---
  // `useMemo` combina os dados estáticos (CASTLE_PATH_GAMES) com os dados dinâmicos do `gameProgress`.
  // Ele só recalcula o array 'levels' quando o progresso do jogo muda.
  const levels = useMemo(() => {
    // Se ainda não recebemos o pathId ou se os dados para esse caminho não existem no contexto, retorna um array vazio.
    if (!pathId || !gameProgress.paths[pathId]) {
      return [];
    }

    const pathState = gameProgress.paths[pathId].games; // Pega o objeto de jogos do caminho atual (ex: 'castelo')
    const baseY = 550; // Posição Y inicial (base do mapa)
    const stepY = 100; // Distância vertical entre os níveis

    return CASTLE_PATH_GAMES.map((gameConfig, index) => {
      // Constrói a chave genérica (ex: 'game1', 'game2') para procurar no contexto
      const genericGameKey = `game${index + 1}`;

      // Busca o status no contexto usando a chave genérica. Se não encontrar, assume como 'locked'.
      const statusFromContext =
        pathState[genericGameKey]?.status || LEVEL_STATES.LOCKED;

      // Retorna um objeto completo com todos os dados do nível
      return {
        ...gameConfig, // id, name, route, x
        y: baseY - index * stepY, // Posição Y calculada
        state: statusFromContext, // O status dinâmico vindo do contexto!
      };
    });
  }, [gameProgress, pathId]); // Array de dependências: recalcula se o progresso ou o pathId mudar.

  const entryPoint = { x: levels[0].x, y: levels[0].y + 100 };
  const treasurePoint = {
    x: levels[levels.length - 1].x,
    y: levels[levels.length - 1].y - 200,
  };

  const handlePressLevel = async (level, index) => {
    // Impede cliques múltiplos se já estiver carregando
    if (isLoading) return;

    if (level.state === LEVEL_STATES.LOCKED) {
      Alert.alert(
        "Nível bloqueado",
        "Complete os anteriores para desbloquear."
      );

      return;
    }
    // Alert.alert(`Nível ${level.id}`, "Vamos jogar!");
    // if (level.id === 1) {
    //   setLoading(true);

    //   // 1. Mostra loading
    //   router.push("/loading");

    //   // 2. Pré-carrega a tela destino
    //   await import("../app/fishgame"); // Caminho da próxima tela

    //   // 3. Navega quando estiver carregado
    //   router.replace("/fishgame");
    // }

    setIsLoading(true);
    try {
      // console.log("Carregando jogo:", level.name);
      // 1. Mostra a tela de loading
      router.push("/loading");

      // 2. Pré-carrega a tela destino usando nossa nova função explícita
      await preloadGameModule(level.route);

      // 3. Navega quando estiver carregado
      const contextKey = `game${index + 1}`;

      router.replace({
        pathname: level.route,
        params: {
          pathId: pathId,
          gameId: level.id,
          contextKey: contextKey,
          difficulty: level.difficulty,
          gameType: level.gameType,
        },
      });
    } catch (error) {
      console.error("Erro ao carregar o jogo:", error);
      router.back();
      Alert.alert("Erro", "Não foi possível carregar o jogo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Curva mais acentuada

  // make it more curvy in the middle of path
  const generatePath = (start, end, index) => {
    const curveStrength = 150; // Aumente isso para mais curvatura
    const direction = index % 2 === 0 ? 1 : -1;

    const controlX = (start.x + end.x) / 2 + direction * curveStrength;
    // const controlY = (start.y + end.y) / 2;
    const controlY = start.y + (end.y - start.y) / 2;

    return `M${start.x},${start.y} Q${controlX},${controlY} ${end.x},${end.y}`;
  };

  const router = useRouter();
  const scales = createSharedScales(levels.length);

  // Iniciar animações (uma vez)
  useEffect(() => {
    scales.forEach((scale) => {
      scale.value = withRepeat(withTiming(1.05, { duration: 1200 }), -1, true);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      > */}
      {/* <Image
          source={require("../assets/images/treasure.png")} // substitua pelo seu caminho real
          style={{
            position: "absolute",
            top: levels[levels.length - 1].y - 130,
            left: levels[levels.length - 1].x - 30,
            width: 60,
            height: 60,
            zIndex: 5,
          }}
        /> */}

      <Svg height={800} width={"100%"} style={{ position: "absolute" }}>
        {/* Caminho vindo de baixo até o nível 1 */}
        <Path
          d={generatePath(
            { x: levels[0].x, y: levels[0].y + 100 },
            levels[0],
            -1
          )}
          stroke="#d49b65"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          // strokeDasharray={"10 8"}
          strokeDasharray={
            levels[0].state === LEVEL_STATES.COMPLETED ? "0" : "10 8"
          }
        />

        {/* Caminhos entre os níveis */}
        {levels.slice(0, -1).map((level, index) => (
          <Path
            key={`path-${level.id}`}
            d={generatePath(level, levels[index + 1], index)}
            // stroke={stateColors[levels[index + 1].state] || " #d49b65"}
            stroke={"#d49b65"}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={
              levels[index + 1].state === LEVEL_STATES.COMPLETED ? "0" : "10 8"
            }
          />
        ))}

        {/* Caminho do nível 6 até o baú */}
        <Path
          d={generatePath(
            levels[levels.length - 1],
            {
              x: windowWidth * 0.5,
              y: -5,
            },
            levels.length - 1
          )}
          stroke="#d49b65"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={"10 8"}
        />
      </Svg>

      {/* Botões dos níveis com animação e rotação */}
      {levels.map((level, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [
            { scale: scales[index].value },
            {
              rotate:
                index < 3
                  ? `${(index * 20) % 360}deg`
                  : `${(index * -5) % 360}deg`,
            },
          ],
        }));

        return (
          <Animated.View
            key={level.id}
            style={[
              styles.levelButton,
              {
                top: level.y - 42.5,
                left: level.x - 42.5,
              },
              animatedStyle,
            ]}
          >
            {/* brilho atrás da concha */}
            <Image
              source={brilhoImg}
              resizeMode="contain"
              style={[styles.shineImage]}
            />

            <TouchableOpacity
              onPress={() => handlePressLevel(level, index)}
              activeOpacity={level.state === LEVEL_STATES.LOCKED ? 1 : 0.4}
              style={[
                { flex: 1 },
                // index === 2 && { zIndex: 1 },
              ]} // Ajuste a posição do botão do nível 4
            >
              <ImageBackground
                source={shellImages[(level.id - 1) % shellImages.length]}
                style={[
                  styles.shellImage,
                  level.state === LEVEL_STATES.LOCKED && {
                    filter: "grayscale(100%)",
                  },
                ]}
                resizeMode="contain"
              >
                <Text style={styles.levelText}>{level.id}</Text>
                {level.state === LEVEL_STATES.LOCKED && (
                  <Text style={styles.lockSymbol}>🔒</Text>
                )}
              </ImageBackground>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
      {/* </ScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // height: 620,
    width: "100%",
    // justifyContent: "center",
    // alignItems: "center",
    flex: 1,
    // backgroundColor: "#f0f0f0",
    // position: "relative",
  },
  // scrollView: {
  //   flex: 1,
  // },
  // contentContainer: {
  //   position: "relative",
  //   height: 600,
  //   width: 300,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  shellImage: {
    width: 85,
    height: 85,
    justifyContent: "center",
    alignItems: "center",
  },
  shineImage: {
    position: "absolute",
    width: 225,
    height: 225,
    top: -60,
    left: -60,
    zIndex: 0,
    // opacity: 0.7,
  },

  levelButton: {
    position: "absolute",
    width: 100,
    height: 100,
    zIndex: 10,
  },

  levelText: {
    fontFamily: "TTMilksCasualPie", // Fonte customizada
    fontSize: 30,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  lockSymbol: {
    position: "absolute",
    bottom: 4,
    fontSize: 24,
    color: "#fff",
    // backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
});
