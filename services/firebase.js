// services/firebase.js - Configuração para Expo
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase do Console usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "838847807679",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:838847807679:web:e874401651ae4ac51b460a",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZYB2LTNZ9F",
};

// Inicializar Firebase
let app;
let auth;
let firestore;

try {
  // Verificar se já foi inicializado
  if (getApps().length === 0) {
    // console.log("🔥 Inicializando Firebase...");
    app = initializeApp(firebaseConfig);
  } else {
    // console.log("🔥 Firebase já inicializado");
    app = getApps()[0];
  }

  // Inicializar Auth
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    // console.log("✅ Firebase Auth inicializado com AsyncStorage");
  } catch (error) {
    // Se já foi inicializado, pegar a instância existente
    if (error.code === "auth/already-initialized") {
      auth = getAuth(app);
      // console.log("✅ Firebase Auth já inicializado");
    } else {
      throw error;
    }
  }

  // Inicializar Firestore
  firestore = getFirestore(app);
  // console.log("✅ Firestore inicializado");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error);
  throw error;
}

export { auth, firestore };
export default app;
