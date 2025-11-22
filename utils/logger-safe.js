// utils/logger-safe.js
// Versão simplificada e segura do logger para depuração

// Função auxiliar para verificar se estamos em desenvolvimento
function checkDevelopmentMode() {
  try {
    // Múltiplas verificações para garantir compatibilidade
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "development"
    ) {
      return true;
    }

    // Verificar __DEV__ de forma segura
    if (typeof global !== "undefined" && global.__DEV__ === true) {
      return true;
    }

    if (typeof window !== "undefined" && window.__DEV__ === true) {
      return true;
    }

    // Fallback: assumir desenvolvimento se console.debug está disponível
    return typeof console.debug === "function";
  } catch (error) {
    // Em caso de qualquer erro, assumir produção
    return false;
  }
}

const isDev = checkDevelopmentMode();

// Logger super simples e seguro
export const logger = {
  dev: {
    auth: isDev ? (...args) => console.log("🔐 [AUTH]", ...args) : () => {},
    game: isDev ? (...args) => console.log("🎮 [GAME]", ...args) : () => {},
    firebase: isDev ? (...args) => console.log("🔥 [FIREBASE]", ...args) : () => {},
    navigation: isDev ? (...args) => console.log("📍 [NAV]", ...args) : () => {},
    achievement: isDev ? (...args) => console.log("🏆 [ACHIEVEMENT]", ...args) : () => {},
    sync: isDev ? (...args) => console.log("🔄 [SYNC]", ...args) : () => {},
    progress: isDev ? (...args) => console.log("📊 [PROGRESS]", ...args) : () => {},
    log: () => {},
    info: () => {},
    warn: isDev ? console.warn : () => {},
    debug: () => {},
  },

  // Logs que sempre funcionam
  error: (...args) => console.error(...args),
  critical: (...args) => console.error("🚨 [CRITICAL]", ...args),
  userAction: (...args) => console.log("👤 [USER]", ...args),
  systemEvent: (...args) => console.log("⚙️ [SYSTEM]", ...args),

  // Utilitários
  conditional: (condition, ...args) => {
    if (condition) console.log(...args);
  },

  level: (level, ...args) => {
    switch (level) {
      case "debug":
        if (isDev) console.debug(...args);
        break;
      case "info":
        if (isDev) console.info(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
    }
  },
};

export default logger;
