import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  StyleSheet,
  ImageBackground,
  Keyboard,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
// Importações do Reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS, // Para executar funções JS a partir da UI thread (ex: setState)
  // Easing, // Importe se precisar de easings específicos não padrão
} from "react-native-reanimated";

// Obtém a largura da tela
const { width } = Dimensions.get("window");

// Crie um componente TouchableOpacity animável com Reanimated
// Isso permite que o próprio TouchableOpacity receba estilos animados.
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function Login() {
  const [Email, onChangeEmail] = useState("");
  const [Password, onChangePassword] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [stayConnected, setStayConnected] = useState(false);
  const [isValid, setIsValid] = useState(true); // Estado para controle de validação

  // Estado para controlar a visibilidade LÓGICA do pop-up de ajuda
  const [isHelp, setIsHelp] = useState(false);
  // Valor compartilhado do Reanimated para a opacidade do pop-up
  const overlayOpacity = useSharedValue(0); // Inicia com 0 (transparente)

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Hook de navegação do Expo Router

  const validateEmail = (text) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return emailRegex.test(text);
  };

  const handleNavigateRegister = async () => {
    setIsLoading(true);

    // 1. Mostra loading
    router.push("./loading");

    // 2. Pré-carrega a tela destino
    await import("./register/emailpage"); // Caminho da próxima tela

    // 3. Navega quando estiver carregado
    router.replace("./register/emailpage");

    setIsLoading(false);
  };

  const handleNavigateLogin = async () => {
    if (!validateEmail(Email) || Password.length < 5) {
      setIsValid(false);
      return; // Se os campos não forem válidos, não prossegue com a navegação
    }

    setIsLoading(true);

    // 1. Mostra loading
    router.push("./loading");

    // 2. Pré-carrega a tela destino
    await import("./home"); // Caminho da próxima tela

    // 3. Navega quando estiver carregado
    router.replace("./home");

    setIsLoading(false);
  };

  // useEffect para disparar a animação de entrada quando isHelp se torna true
  // Esta é uma forma limpa de iniciar a animação após o estado mudar.
  useEffect(() => {
    if (isHelp) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
    }
    // Não precisamos de um 'else' aqui para o fade-out se o handlePress
    // já cuida de animar para 0 e *depois* setar isHelp para false.
  }, [isHelp, overlayOpacity]); // Executa quando isHelp ou overlayOpacity (identidade) muda

  // Função para controlar a exibição (toggle) do pop-up de ajuda
  const handlePress = () => {
    if (!isHelp) {
      // Para mostrar: Define o estado lógico e o useEffect acima iniciará a animação de fade-in.
      // Garante que a opacidade comece de 0 caso haja cliques rápidos.
      overlayOpacity.value = 0;
      setIsHelp(true);
    } else {
      // Para esconder: Inicia a animação de fade-out.
      // No callback da animação, o estado lógico isHelp será definido como false.
      overlayOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          // Importante: runOnJS para chamar uma função da thread JS (setState)
          // a partir do callback da animação da UI thread.
          runOnJS(setIsHelp)(false);
        }
      });
    }
  };

  // Define o estilo animado para o overlay usando useAnimatedStyle do Reanimated
  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require("../assets/images/background_login.png")}
        style={{ flex: 1, width: "100%", height: "100%" }}
        resizeMode="cover"
      >
        {/* Logo fora da content */}

        <View style={styles.content}>
          <Image
            source={require("../assets/images/textologo.png")}
            style={styles.logo}
          />

          <View style={{ width: "85%" }}>
            {/* Email input */}
            {/* <View style={styles.inputContainer}> */}
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                style={[styles.input, emailFocus && styles.inputFocused]}
                onChangeText={onChangeEmail}
                value={Email}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#2f5195"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
              />
            </ScrollView>
            {/* </View> */}

            {/* Password input */}
            {/* <View style={styles.inputContainer}> */}
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                style={[styles.input, passwordFocus && styles.inputFocused]}
                onChangeText={onChangePassword}
                value={Password}
                placeholder="Senha"
                placeholderTextColor="#2f5195"
                secureTextEntry
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
              />
            </ScrollView>
            {/* </View> */}

            <View style={styles.passwordOptionsContainer}>
              <TouchableOpacity
                onPress={() => setStayConnected(!stayConnected)}
              >
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxBox,
                      stayConnected && styles.checkboxChecked,
                    ]}
                    onPress={() => setStayConnected(!stayConnected)}
                  >
                    {stayConnected && <View style={styles.checkboxTick} />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>
                    MANTENHA-ME CONECTADO
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
              //  onPress={}
              >
                <Text style={styles.forgot}>ESQUECEU SUA SENHA?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isValid && (
            <Text
              style={{
                color: "red",
                fontSize: 14,
                fontFamily: "TTMilksCasualPie",
                textAlign: "center",
              }}
            >
              Por favor, preencha todos os campos corretamente.
            </Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleNavigateLogin}>
            <Text style={styles.buttonText}>ENTRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNavigateRegister}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.Register}>
              NÃO TEM UMA CONTA?{" "}
              <Text style={styles.linkText}>CADASTRE-SE</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpBubble} onPress={handlePress}>
            <Image
              source={require("../assets/images/help_bubble.png")}
              style={styles.helpImage}
            />
          </TouchableOpacity>

          {/* Seção do pop-up de ajuda, renderizada condicionalmente */}
          {isHelp && (
            // AnimatedTouchableOpacity (do Reanimated) para o overlay completo
            <AnimatedTouchableOpacity
              style={[styles.overlay, animatedOverlayStyle]} // Aplica o estilo animado aqui
              onPress={handlePress} // Clicar em qualquer lugar do overlay fecha
              activeOpacity={1}
              // key={"helpOverlayReanimated"} // Pode adicionar uma key se suspeitar de problemas de montagem
            >
              {/* Container para o conteúdo do overlay. Não precisa mais ser Animated.View
                  se a opacidade já está no AnimatedTouchableOpacity pai.
                  Mas manter como View é bom para estrutura.
              */}
              <View style={styles.overlayContentContainer}>
                <View
                  style={styles.helpBox}
                  // onStartShouldSetResponder={() => true} // Removido/Comentado para permitir que clique no conteúdo feche
                >
                  <Text style={styles.helpTitle}>
                    não consegue fazer login?
                  </Text>
                  <View style={styles.helpContentRow}>
                    <View style={styles.baloesWrapper}>
                      <ImageBackground
                        source={require("@/assets/images/balao_ajuda.png")}
                        style={styles.balao}
                        resizeMode="cover"
                      >
                        <Text style={styles.balaoTexto}>
                          chame seu responsável ou quem criou a conta
                        </Text>
                      </ImageBackground>
                      <ImageBackground
                        style={styles.balao}
                        source={require("@/assets/images/balao_ajuda.png")}
                        resizeMode="cover"
                      >
                        <Text style={styles.balaoTexto}>
                          peça-o <Text style={styles.enfasis}>gentilmente</Text>{" "}
                          para que acesse sua conta cadastrada!
                        </Text>
                      </ImageBackground>
                    </View>
                    <View style={styles.tartarugaWrapper}>
                      <Image
                        source={require("../assets/images/poses_tuti/tuti_gira.png")}
                        style={styles.tartarugaImage}
                        resizeMode="contain"
                        accessibilityLabel="Tartaruga explicando o código de segurança"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </AnimatedTouchableOpacity>
          )}
        </View>
        {/* <StatusBar style="auto" /> */}
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    // width: "100%",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  logo: {
    width: "85%",
    maxHeight: "30%",
    resizeMode: "contain",
    marginTop: "20%",
  },
  content: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    width: "100%",
    // paddingBottom: 10,
  },

  inputContainer: {
    marginBottom: 10,
    marginTop: "10%",
    // width: "90%",
  },
  input: {
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 20,
    width: "100%",
    fontSize: 13,
    fontFamily: "TTMilksCasualPie",
    backgroundColor: "rgba(102, 172, 206, 0.5)",
    color: "#5483c4",
    marginBottom: "5%",
  },
  inputFocused: {
    backgroundColor: "#ffffff",
    fontSize: 13,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  passwordOptionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 15,
    height: 15,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#5483c4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  checkboxChecked: {
    backgroundColor: "#5483c4",
  },
  checkboxTick: {
    width: 10,
    height: 10,
    backgroundColor: "white",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#5483c4",
    fontFamily: "TTMilksCasualPie",
  },
  forgot: {
    fontSize: 10,
    color: "#5483c4",
    fontFamily: "TTMilksCasualPie",
    // marginLeft: 10,
  },
  button: {
    height: 50,
    width: "52%",
    backgroundColor: "#ff9eda",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 23,
    marginTop: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "TTMilksCasualPie",
  },
  Register: {
    marginTop: 9,
    fontSize: 18,
    alignItems: "center",
    fontFamily: "TTMilksCasualPie",
    color: "#5483c4",
  },
  linkText: {
    color: "#ff9eda",
    alignItems: "center",
    fontSize: 18,
    justifyContent: "center",
    fontFamily: "TTMilksCasualPie",
  },
  helpBubble: {
    // position: "absolute",
    // bottom: 50,
    marginTop: "20%",
  },
  helpImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(98, 191, 236, 0.82)",
    paddingTop: 50, // Mantido do seu código
    alignItems: "center",
    // justifyContent: "center", // Removido para que paddingTop tenha efeito, overlayContentContainer pode centralizar
  },
  overlayContentContainer: {
    width: "100%",
    justifyContent: "center", // Centraliza helpBox verticalmente
    alignItems: "center", // Centraliza helpBox horizontalmente
  },
  helpBox: {
    width: "95%",
    // maxWidth: 480,
    backgroundColor: "transparent",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  helpTitle: {
    fontFamily: "TTMilksCasualPie",
    fontSize: 35,
    color: "#ff64c6",
    textAlign: "center",
    marginBottom: 50,
    textShadowColor: "#48899d",
    textShadowOffset: {
      width: 1.5,
      height: 1.5,
    },
    textShadowRadius: 1.41,
    textShadowOpacity: 0.4,
    elevation: 3, // Adicionado para compatibilidade com Android
    marginTop: 10, // Adicionado para espaçamento
    // width: "100%",
    // backgroundColor: "white",
  },
  enfasis: {
    color: "#b07aff",
    fontFamily: "TTMilksCasualPie",
  },
  helpContentRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  baloesWrapper: {
    flex: 2,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginTop: 85, // Mantido do seu código
    marginRight: 40, // Mudado de 80 para 10 para menos espaço ou ajuste conforme necessário
  },
  balao: {
    borderRadius: 20,
    paddingTop: 30,
    paddingHorizontal: 28,
    width: width * 0.6,
    height: width * 0.36,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Adicionado para ImageBackground
  },
  balaoTexto: {
    fontSize: 13,
    lineHeight: 17,
    color: "#47276b",
    fontFamily: "TTMilksCasualPie",
    textAlign: "center",
    marginTop: 0, // Removido o marginTop: 30, o padding/justifyContent do balão deve cuidar disso
  },
  tartarugaWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
    marginTop: 0,
    // marginLeft: width * 0.17, // Removido para um layout flex mais simples, ajuste com padding/margin no baloesWrapper se necessário
  },
  tartarugaImage: {
    width: width, // Aumentei um pouco em relação à sugestão anterior, ajuste fino aqui!
    height: width,
    position: "absolute", // Mantido do seu código recente
    right: width * -0.55, // Ajustado o 'right' para tentar posicionar como na imagem
    // Valores negativos aqui podem fazer a imagem sair da tela ou do wrapper.
    // Pode ser melhor não usar position:absolute e controlar com flex e margins/paddings.
    // Se remover absolute, ajuste o tartarugaWrapper.
    // top: 0, // Se precisar de ajuste vertical dentro do wrapper
  },
});
