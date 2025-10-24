// services/firebase.js - Configuração para Expo
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase do Console
const firebaseConfig = {
  apiKey: "AIzaSyBUAj3Yp6RrlRd48qOulFMHTj4fsP2eZ0M",
  authDomain: "mundo-da-tuti.firebaseapp.com",
  projectId: "mundo-da-tuti",
  storageBucket: "mundo-da-tuti.firebasestorage.app",
  messagingSenderId: "838847807679",
  appId: "1:838847807679:web:e874401651ae4ac51b460a",
  measurementId: "G-ZYB2LTNZ9F",
};

// Inicializar Firebase
let app;
let auth;
let firestore;

try {
  // Verificar se já foi inicializado
  if (getApps().length === 0) {
    console.log("🔥 Inicializando Firebase...");
    app = initializeApp(firebaseConfig);
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
      throw error;
    }
  }

  // Inicializar Firestore
  firestore = getFirestore(app);
  console.log("✅ Firestore inicializado");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error);
  throw error;
}

export { auth, firestore };
export default app;
