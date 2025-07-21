import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCJlcRwdufgD4wrZVIwxd8crpLm1rHinng",
  authDomain: "ayawparlay.firebaseapp.com",
  projectId: "ayawparlay",
  storageBucket: "ayawparlay.firebasestorage.app",
  messagingSenderId: "65465651127",
  appId: "1:65465651127:web:91e22c3e9133b1f2b0e232",
  measurementId: "G-696Y2481FZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };