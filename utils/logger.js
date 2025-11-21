// utils/logger.js
// Sistema de logs condicional para desenvolvimento vs produção

/**
 * Sistema de logging condicional
 * - Em desenvolvimento (__DEV__ = true): logs específicos são exibidos
 * - Em produção (__DEV__ = false): apenas logs críticos são exibidos
 */

// Verifica se estamos em ambiente de desenvolvimento
const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";

/**
 * Logger para desenvolvimento - apenas logs essenciais
 */
export const devLog = {
  // Logs básicos (desabilitados por padrão para reduzir verbosidade)
  log: () => {}, // Desabilitado - use logger.dev.auth, sync, etc. para logs específicos
  info: () => {},
  warn: isDevelopment ? console.warn : () => {},
  debug: () => {},

  // Logs específicos por categoria (habilitados em desenvolvimento)
  auth: isDevelopment ? (...args) => console.log("🔐 [AUTH]", ...args) : () => {},
  game: isDevelopment ? (...args) => console.log("🎮 [GAME]", ...args) : () => {},
  firebase: isDevelopment ? (...args) => console.log("🔥 [FIREBASE]", ...args) : () => {},
  navigation: isDevelopment ? (...args) => console.log("📍 [NAV]", ...args) : () => {},
  achievement: isDevelopment
    ? (...args) => console.log("🏆 [ACHIEVEMENT]", ...args)
    : () => {},
  sync: isDevelopment ? (...args) => console.log("🔄 [SYNC]", ...args) : () => {},
  progress: isDevelopment ? (...args) => console.log("📊 [PROGRESS]", ...args) : () => {},
};

/**
 * Logger para produção - apenas logs críticos e essenciais
 */
export const prodLog = {
  error: console.error,
  critical: (...args) => console.error("🚨 [CRITICAL]", ...args),
  userAction: (...args) => console.log("👤 [USER]", ...args),
  systemEvent: (...args) => console.log("⚙️ [SYSTEM]", ...args),
};

/**
 * Logger unificado - use este na maioria dos casos
 */
export const logger = {
  // Logs de desenvolvimento (só aparecem em dev)
  dev: devLog,

  // Logs de produção (sempre aparecem)
  error: prodLog.error,
  critical: prodLog.critical,
  userAction: prodLog.userAction,
  systemEvent: prodLog.systemEvent,

  // Método utilitário para logs condicionais personalizados
  conditional: (condition, ...args) => {
    if (condition) console.log(...args);
  },

  // Método para logs com níveis
  level: (level, ...args) => {
    const levels = {
      debug: isDevelopment ? console.debug : () => {},
      info: isDevelopment ? console.info : () => {},
      warn: console.warn, // Warnings sempre visíveis
      error: console.error, // Erros sempre visíveis
    };

    if (levels[level]) {
      levels[level](...args);
    }
  },
};

/**
 * Exemplos de uso:
 *
 * // Logs que só aparecem em desenvolvimento
 * logger.dev.auth('Usuario logado:', userId);
 * logger.dev.sync('Dados sincronizados:', data);
 *
 * // Logs que sempre aparecem (produção)
 * logger.error('Erro crítico:', error);
 * logger.userAction('Usuario completou jogo:', gameId);
 *
 * // Logs condicionais
 * logger.conditional(isDebugMode, 'Debug ativo:', debugData);
 * logger.level('error', 'Erro importante:', errorDetails);
 */

// Exporta também individualmente para flexibilidade
export { isDevelopment };
export default logger;
