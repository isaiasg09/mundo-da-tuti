// services/firebase.js - Configuração para Expo
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase do Console usando variáveis de ambiente
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyADw-4r4fdliNLQYbNUvUTDnTrbCrN_znw",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "mundo-da-tuti.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "mundo-da-tuti",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "mundo-da-tuti.appspot.com",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "838847807679",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:838847807679:web:e874401651ae4ac51b460a",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZYB2LTNZ9F",
};

// Validar configuração básica
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Configuração do Firebase incompleta:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    env: {
      apiKey: !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      projectId: !!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    },
  });
  throw new Error(
    "Configuração do Firebase incompleta - verifique as variáveis de ambiente"
  );
}

// Inicializar Firebase
let app;
let auth;
let firestore;

try {
  // Verificar se já foi inicializado
  if (getApps().length === 0) {
    console.log("🔥 Inicializando Firebase...");
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App inicializado");
  } else {
    console.log("🔥 Firebase já inicializado");
    app = getApps()[0];
  }

  // Inicializar Auth
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log("✅ Firebase Auth inicializado com AsyncStorage");
  } catch (error) {
    // Se já foi inicializado, pegar a instância existente
    if (error.code === "auth/already-initialized") {
      auth = getAuth(app);
      console.log("✅ Firebase Auth já inicializado");
    } else {
      console.error("❌ Erro ao inicializar Auth:", error);
      throw error;
    }
  }

  // Inicializar Firestore
  firestore = getFirestore(app);
  console.log("✅ Firestore inicializado");

  console.log("🎉 Firebase completamente inicializado!");
} catch (error) {
  console.error("❌ Erro crítico ao inicializar Firebase:", error);
  console.error("Config:", firebaseConfig);
  throw error;
}

export { auth, firestore };
export default app;
