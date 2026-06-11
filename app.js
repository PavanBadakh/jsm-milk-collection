import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
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

async function searchFarmer() {

    let farmerNo =
    document.getElementById("farmerNo").value;

    const farmerRef = doc(db, "farmers", farmerNo);
    const farmerSnap = await getDoc(farmerRef);

    if (!farmerSnap.exists()) {
        document.getElementById("result").innerHTML = "Farmer Not Found";
        return;
    }

    const recordsRef = collection(db, "farmers", farmerNo, "records");
    const recordsSnap = await getDocs(recordsRef);

    const data = farmerSnap.data();

let html = `<h3>${data.name}</h3>`;

let records = [];

recordsSnap.forEach((record) => {
    records.push({
        id: record.id,
        data: record.data()
    });
});

records.reverse();
records = records.slice(0, 10);
records.forEach((record) => {
    let r = record.data;

    html += `
    <div class="card">
        <b>${record.id}</b><br>
        Litre: ${r.litre}<br>
        Fat: ${r.fat}<br>
        Degree: ${r.degree}
    </div>
    `;
});



    document.getElementById("result").innerHTML = html;
    document.getElementById("farmerNo").value = "";
}

window.searchFarmer = searchFarmer;