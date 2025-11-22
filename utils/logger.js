// utils/logger.js
// Versão ultra-robusta do logger que nunca falha

// Função que sempre funciona para logs críticos
const safeConsoleError = (...args) => {
  try {
    if (typeof console !== "undefined" && console.error) {
      console.error(...args);
    }
  } catch (e) {
    // Silencioso em caso de erro
  }
};

const safeConsoleLog = (...args) => {
  try {
    if (typeof console !== "undefined" && console.log) {
      console.log(...args);
    }
  } catch (e) {
    // Silencioso em caso de erro
  }
};

const safeConsoleWarn = (...args) => {
  try {
    if (typeof console !== "undefined" && console.warn) {
      console.warn(...args);
    }
  } catch (e) {
    // Silencioso em caso de erro
  }
};

// Verificação de desenvolvimento mais robusta
let isDev = false;
try {
  // Não usar __DEV__ em produção para evitar problemas
  const processEnv =
    typeof process !== "undefined" && process.env ? process.env.NODE_ENV : "production";
  isDev = processEnv === "development";
} catch (error) {
  isDev = false;
}

// Logger que sempre funciona, mesmo em situações extremas
const createSafeLogger = () => {
  const noOp = () => {};

  return {
    // Logs de desenvolvimento
    dev: {
      auth: isDev ? (...args) => safeConsoleLog("🔐 [AUTH]", ...args) : noOp,
      game: isDev ? (...args) => safeConsoleLog("🎮 [GAME]", ...args) : noOp,
      firebase: isDev ? (...args) => safeConsoleLog("🔥 [FIREBASE]", ...args) : noOp,
      navigation: isDev ? (...args) => safeConsoleLog("📍 [NAV]", ...args) : noOp,
      achievement: isDev
        ? (...args) => safeConsoleLog("🏆 [ACHIEVEMENT]", ...args)
        : noOp,
      sync: isDev ? (...args) => safeConsoleLog("🔄 [SYNC]", ...args) : noOp,
      progress: isDev ? (...args) => safeConsoleLog("📊 [PROGRESS]", ...args) : noOp,
      log: noOp,
      info: noOp,
      warn: isDev ? safeConsoleWarn : noOp,
      debug: noOp,
    },

    // Logs de produção - sempre funcionam
    error: safeConsoleError,
    critical: (...args) => safeConsoleError("🚨 [CRITICAL]", ...args),
    userAction: (...args) => safeConsoleLog("👤 [USER]", ...args),
    systemEvent: (...args) => safeConsoleLog("⚙️ [SYSTEM]", ...args),

    // Utilitários
    conditional: (condition, ...args) => {
      if (condition) safeConsoleLog(...args);
    },

    level: (level, ...args) => {
      switch (level) {
        case "debug":
          if (isDev) safeConsoleLog(...args);
          break;
        case "info":
          if (isDev) safeConsoleLog(...args);
          break;
        case "warn":
          safeConsoleWarn(...args);
          break;
        case "error":
          safeConsoleError(...args);
          break;
        default:
          safeConsoleLog(...args);
      }
    },
  };
};

// Criar o logger
const logger = createSafeLogger();

// Disponibilizar globalmente como fallback
if (typeof global !== "undefined" && !global.logger) {
  global.logger = logger;
}

// Exports seguros
export { logger };
export const devLog = logger.dev;
export const prodLog = {
  error: logger.error,
  critical: logger.critical,
  userAction: logger.userAction,
  systemEvent: logger.systemEvent,
};
export { isDev as isDevelopment };
export default logger;
