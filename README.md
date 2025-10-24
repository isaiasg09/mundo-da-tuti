# 🐢 Mundo da Tuti - Aplicativo Educacional

![Capa do Mundo da Tuti](./assets/images/capa.png)

## 📝 Descrição

O "Mundo da Tuti" é um aplicativo gamificado em desenvolvimento, projetado para auxiliar no desenvolvimento cognitivo e no aprendizado de crianças, com foco especial em temas lúdicos e desafios interativos. O projeto foi construído com Expo e React Native, utilizando as tecnologias mais recentes do ecossistema para criar uma experiência de usuário fluida e moderna.

Este repositório contém todo o código-fonte do aplicativo, desde a estrutura de navegação até os minigames e o sistema de progressão.

---

## ✨ Funcionalidades Implementadas

Até o momento, o projeto conta com as seguintes funcionalidades:

- **Sistema de Navegação Completo:** Utilizando o Expo Router para criar rotas baseadas em arquivos.
- **Fluxo de Cadastro de Usuário:**
  - Telas para criação de código de segurança.
  - Tela de personalização de perfil com nome de usuário e seleção de avatar.
- **Estado Global Centralizado:**
  - **`RegistrationContext`**: Gerencia os dados do formulário de cadastro entre as telas.
  - **`GameContext`**: Controla e rastreia todo o progresso do jogador nos jogos e caminhos.
- **Persistência de Dados:**
  - Uso do `AsyncStorage` para salvar o progresso do jogo, garantindo que o jogador não perca seus dados ao fechar o aplicativo.
- **Sistema de Jogo Dinâmico:**
  - Tela `Home` com um carrossel para seleção de "caminhos" ou mundos.
  * Mapas de níveis (`firstpath`) que exibem visualmente os jogos e seu status (bloqueado, desbloqueado, completo).
  * Lógica de desbloqueio sequencial de jogos e caminhos.
- **Minigames:**
  - **FishGame:** Jogo de contagem de peixes com animações orgânicas.
  - **PlusGame:** Jogo de soma com níveis de dificuldade configuráveis.
- **Animações Ricas:**
  - Uso extensivo da biblioteca `react-native-reanimated` para transições suaves, animações de personagens e efeitos visuais como confetes.

---

## 🛠️ Tecnologias Utilizadas

- **[Expo (SDK 51+)](https://expo.dev/)**: Plataforma para construir aplicações universais com React.
- **[React Native](https://reactnative.dev/)**: Framework para desenvolvimento de apps nativos.
- **[React](https://react.dev/)**: Biblioteca para construir interfaces de usuário.
- **[Expo Router](https://expo.github.io/router/)**: Sistema de navegação baseado em arquivos.
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)**: Biblioteca avançada para animações fluidas.
- **[React Context API](https://react.dev/learn/passing-data-deeply-with-context)**: Para gerenciamento de estado global.
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)**: Para armazenamento de dados local no dispositivo.
- **TypeScript / JavaScript (ES6+)**

---

## 🚀 Como Rodar o Projeto

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o Repositório**

    ```bash
    git clone [https://github.com/isaiasg09/mundo-da-tuti.git](https://github.com/isaiasg09/mundo-da-tuti.git)
    cd mundo-da-tuti
    ```

2.  **Instale as Dependências**
    _Certifique-se de que você tem o Node.js e o npm instalados._

    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**
    _Copie o arquivo de exemplo e configure suas credenciais do Firebase._

    ```bash
    cp .env.example .env
    ```

    Edite o arquivo `.env` e preencha com suas credenciais do Firebase Console:

    ```bash
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    # ... outras variáveis
    ```

4.  **Inicie o Servidor de Desenvolvimento do Expo**

    ```bash
    npx expo start
    ```

5.  **Execute em um Dispositivo ou Emulador**
    - Instale o aplicativo **Expo Go** no seu celular (iOS ou Android).
    - Escaneie o QR code que aparece no terminal com o app Expo Go.
    - Alternativamente, pressione `a` no terminal para abrir em um emulador Android ou `i` para um simulador iOS.

---

## 🔐 Configuração do Firebase

Este projeto utiliza Firebase para autenticação e armazenamento de dados. Para configurar:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Email/Password e Anonymous)
3. Ative Firestore Database
4. Copie as credenciais do projeto para o arquivo `.env`

**⚠️ Importante:** Nunca commite o arquivo `.env` com suas credenciais. Use sempre o `.env.example` como referência.

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE.md) para mais detalhes.
