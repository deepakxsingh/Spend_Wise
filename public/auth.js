// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyDSWxXbMV1tUNICAZmqCImdbAchOLfbido",
  authDomain: "spendwise-a9795.firebaseapp.com",
  projectId: "spendwise-a9795",
  storageBucket: "spendwise-a9795.firebasestorage.app",
  messagingSenderId: "126424935390",
  appId: "1:126424935390:web:167f22ecdb341ae3258b4f",
  measurementId: "G-B9VHP8DGBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// Make function GLOBAL so onclick can find it
window.googleLogin = function () {
  console.log("Google login clicked");

  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Logged in as:", result.user.email);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Login error:", error);
    //   alert(error.message);
    });
};

// Protect dashboard (redirect if not logged in)
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("dashboard")) {
    window.location.href = "index.html";
  }
});

//  Logout support (for dashboard page)
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
