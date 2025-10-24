// utils/accountManager.js
import AsyncStorage from "@react-native-async-storage/async-storage";

class AccountManager {
  static BASE_KEY = "@game_progress";

  // Listar todas as contas com dados salvos
  static async getLocalAccounts() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const progressKeys = allKeys.filter((key) => key.startsWith(this.BASE_KEY));

      const accounts = [];

      for (const key of progressKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parts = key.replace(`${this.BASE_KEY}_`, "").split("_");
          const guardianId = parts[0];
          const childId = parts[1];

          accounts.push({
            guardianId,
            childId,
            storageKey: key,
            lastModified: JSON.parse(data).lastModified || new Date().toISOString(),
          });
        }
      }

      return accounts;
    } catch (error) {
      console.error("❌ Erro ao listar contas locais:", error);
      return [];
    }
  }

  // Limpar dados de uma conta específica
  static async clearAccountData(guardianId, childId) {
    try {
      const storageKey = `${this.BASE_KEY}_${guardianId}_${childId}`;
      await AsyncStorage.removeItem(storageKey);
      console.log(`🗑️ Dados removidos para: ${guardianId}/${childId}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao limpar conta:", error);
      return { success: false, error: error.message };
    }
  }

  // Limpar todas as contas (útil para debug/reset)
  static async clearAllAccounts() {
    try {
      const accounts = await this.getLocalAccounts();

      for (const account of accounts) {
        await AsyncStorage.removeItem(account.storageKey);
      }

      console.log(`🗑️ ${accounts.length} contas locais removidas`);
      return { success: true, count: accounts.length };
    } catch (error) {
      console.error("❌ Erro ao limpar todas as contas:", error);
      return { success: false, error: error.message };
    }
  }

  // Verificar tamanho dos dados locais
  static async getStorageSize() {
    try {
      const accounts = await this.getLocalAccounts();
      let totalSize = 0;

      for (const account of accounts) {
        const data = await AsyncStorage.getItem(account.storageKey);
        if (data) {
          totalSize += data.length;
        }
      }

      return {
        accounts: accounts.length,
        sizeBytes: totalSize,
        sizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      };
    } catch (error) {
      console.error("❌ Erro ao calcular tamanho:", error);
      return { accounts: 0, sizeBytes: 0, sizeMB: "0" };
    }
  }
}

export default AccountManager;
