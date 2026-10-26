import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCLyOpySWa_Vy-WPdf10D3LdmwjtEX_zs",
  authDomain: "campus-lost-and-found-po-f4b27.firebaseapp.com",
  projectId: "campus-lost-and-found-po-f4b27",
  storageBucket: "campus-lost-and-found-po-f4b27.firebasestorage.app",
  messagingSenderId: "359888631050",
  appId: "1:359888631050:web:efd3077b642a30a73ff6f3"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };