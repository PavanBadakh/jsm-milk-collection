import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2cnWWzYeSNpva3As5apvIo3O_6Ub87gY",
  authDomain: "jsm-milk-collection.firebaseapp.com",
  projectId: "jsm-milk-collection",
  storageBucket: "jsm-milk-collection.firebasestorage.app",
  messagingSenderId: "446366055120",
  appId: "1:446366055120:web:3f5428eb0893b7b8bcfcd5",
  measurementId: "G-TFQMP963JV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveFarmer() {

alert("Save button works");
console.log("Function started");
let farmerNo = document.getElementById("farmerNo").value;
let date = document.getElementById("date").value;
let session = document.getElementById("session").value;
  let name = document.getElementById("name").value;
  
  let litre = document.getElementById("litre").value;
  let fat = document.getElementById("fat").value;
  let degree = document.getElementById("degree").value;

  
  await setDoc(doc(db, "farmers", farmerNo), {
  name: name
});
await setDoc(
  doc(db, "farmers", farmerNo, "records", date + "_" + session),
  {
    litre: litre,
    fat: fat,
    degree: degree
  }
);
  alert("Data Saved Successfully");
  console.log("Data saved");

  document.getElementById("msg").innerHTML =
  "Data Saved Successfully";
}

window.saveFarmer = saveFarmer;