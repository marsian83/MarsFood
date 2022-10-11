const {initializeApp} = require("firebase/app")


const firebaseConfig = {
  apiKey: "AIzaSyBZH6U2g6LukmL_CMKUgmOuQkFkn1xV6Cw",
  authDomain: "marsfood-image-storage.firebaseapp.com",
  projectId: "marsfood-image-storage",
  storageBucket: "marsfood-image-storage.appspot.com",
  messagingSenderId: "147397188469",
  appId: "1:147397188469:web:bea477f70ff5cce5a3113c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


module.exports = { app };
