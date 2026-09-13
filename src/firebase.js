import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <-- Yeh dono hona zaroori hai
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBnURksgQbnXbuxipXAt--egUpahd1LhcY",
  authDomain: "color-game-249ab.firebaseapp.com",
  projectId: "color-game-249ab",
  storageBucket: "color-game-249ab.firebasestorage.app",
  messagingSenderId: "589658639665",
  appId: "1:589658639665:web:b5c9e4f4c227ea7ebbf410",
  measurementId: "G-QCYSKH8Z17"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // <-- Yeh export zaroori hai