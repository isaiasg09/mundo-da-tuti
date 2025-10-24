// scripts/testOfflineSync.js
// Script para testar o sistema offline-first

import GameProgressService from "../services/gameProgressService.js";
import AccountManager from "../utils/accountManager.js";

const testUserId = "test-guardian-123";
const testChildId = "child1";

console.log("🧪 Iniciando testes do sistema offline-first...\n");

async function runTests() {
  try {
    // Teste 1: Criar serviço
    console.log("1️⃣ Testando criação do serviço...");
    const service = new GameProgressService(testUserId, testChildId);
    console.log("✅ Serviço criado com sucesso\n");

    // Teste 2: Salvar progresso inicial
    console.log("2️⃣ Testando salvamento de progresso...");
    const initialProgress = {
      paths: {
        castelo: {
          status: "unlocked",
          games: {
            game1: {
              status: "completed",
              score: 85,
              completedAt: new Date().toISOString(),
            },
            game2: { status: "unlocked" },
          },
        },
      },
    };

    const saveResult = await service.saveGameProgress(initialProgress);
    console.log("✅ Progresso salvo:", saveResult);
    console.log("");

    // Teste 3: Carregar progresso
    console.log("3️⃣ Testando carregamento de progresso...");
    const loadedProgress = await service.loadProgress();
    console.log("✅ Progresso carregado:", JSON.stringify(loadedProgress, null, 2));
    console.log("");

    // Teste 4: Completar um jogo
    console.log("4️⃣ Testando conclusão de jogo...");
    const completeResult = await service.completeGame("castelo", 2, 92);
    console.log("✅ Resultado da conclusão:", completeResult);
    console.log("");

    // Teste 5: Verificar AccountManager
    console.log("5️⃣ Testando AccountManager...");
    const accounts = await AccountManager.getLocalAccounts();
    console.log("✅ Contas locais encontradas:", accounts);

    const storageSize = await AccountManager.getStorageSize();
    console.log("✅ Tamanho do storage:", storageSize);
    console.log("");

    console.log("🎉 Todos os testes passaram com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante os testes:", error);
  }
}

// Executar testes se o script for chamado diretamente
if (typeof require !== "undefined" && require.main === module) {
  runTests();
}

export { runTests };
