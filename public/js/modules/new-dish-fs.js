import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-storage.js";

// FIREBASE

const firebaseConfig = {
  apiKey: "AIzaSyAOdMUrv9owsxQmfbODa0x3FtHjV0yTa4M",
  authDomain: "marsfood-5f5d8.firebaseapp.com",
  projectId: "marsfood-5f5d8",
  storageBucket: "marsfood-5f5d8.appspot.com",
  messagingSenderId: "161140792669",
  appId: "1:161140792669:web:178911ed51fb1faf6fdcb4",
  measurementId: "G-PB69DLBQM4",
};

// Initialize Firebase
var firebaseApp = initializeApp(firebaseConfig);
var storage = getStorage(firebaseApp);
var storageRef = ref(storage, "dish_thumbnails");

let uploadButton = document.querySelector("#upload-input-button");
let imageInput = document.querySelector("#image-input");

var upload2fs = async () => {
  const file = imageInput.files[0];
  uploadBytes(storageRef, file).then((snapshot) => {
    uploadButton.type = "submit";
    uploadButton.innerHTML = `Upload Dish`;
  });
}
