// context/AuthContext.js - Versão simplificada
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  guardianData: null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [guardianData, setGuardianData] = useState(null);

  const login = async (email, password) => {
    console.log("🔐 AuthContext: Iniciando login...");
    setIsLoading(true);

    try {
      // Importação dinâmica para evitar problemas de inicialização
      const AuthService = await import("../services/authService");
      const result = await AuthService.default.login(email, password);

      if (result.success) {
        console.log("✅ AuthContext: Login realizado com sucesso");
        setUser({ uid: result.guardianId });
      } else {
        console.error("❌ AuthContext: Erro no login:", result.error);
      }

      return result;
    } catch (error) {
      console.error("💥 AuthContext: Erro inesperado no login:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("🚪 AuthContext: Iniciando logout...");
    setIsLoading(true);

    try {
      // Importação dinâmica para evitar problemas de inicialização
      const AuthService = await import("../services/authService");
      const result = await AuthService.default.logout();

      if (result.success) {
        console.log("✅ AuthContext: Logout realizado com sucesso");
        setUser(null);
        setGuardianData(null);
      } else {
        console.error("❌ AuthContext: Erro no logout:", result.error);
      }

      return result;
    } catch (error) {
      console.error("💥 AuthContext: Erro inesperado no logout:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    guardianData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthContext;
