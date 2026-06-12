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


function showDate(date){

let data = window.groupedData[date];

let html = `<h4>📅 ${date}</h4>`;

if(data.morning){

html += `
<p>🌅 Morning</p>
<p>🥛 ${data.morning.litre}</p>
<p>🧈 ${data.morning.fat}</p>
<p>🌡️ ${data.morning.degree}</p>
`;
}

if(data.evening){

html += `
<p>🌙 Evening</p>
<p>🥛 ${data.evening.litre}</p>
<p>🧈 ${data.evening.fat}</p>
<p>🌡️ ${data.evening.degree}</p>
`;
}

document.getElementById("historyDetails").innerHTML = html;

}

window.showDate = showDate;
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
window.groupedData = {};
let grouped = {};

records.forEach((record) => {

    let parts = record.id.split("_");

    let date = parts[0];
    let session = parts[1];

    if (!grouped[date]) {
        grouped[date] = {};
    }

    grouped[date][session] = record.data;
});

console.log(grouped);
window.groupedData = grouped;
let dates = Object.keys(grouped);

let latestDate = dates[0];

let latest = grouped[latestDate];

html += `
<div class="latest-card">

<h2>📅 Today</h2>
<p>${latestDate}</p>
`;

if(latest.morning){

html += `
<h3>🌅 Morning</h3>

<p>🥛 ${latest.morning.litre}</p>
<p>🧈 ${latest.morning.fat}</p>
<p>🌡️ ${latest.morning.degree}</p>
`;
}

if(latest.evening){

html += `
<h3>🌙 Evening</h3>

<p>🥛 ${latest.evening.litre}</p>
<p>🧈 ${latest.evening.fat}</p>
<p>🌡️ ${latest.evening.degree}</p>
`;
}

html += `</div>`;

html += `
<h3>📚 History</h3>

<div id="historyDetails"></div>
`;

for(let i=1;i<dates.length;i++){

html += `
<div class="card"
onclick="showDate('${dates[i]}')"
style="cursor:pointer;">

▶ ${dates[i]}

</div>
`;
}

    document.getElementById("result").innerHTML = html;
    document.getElementById("farmerNo").value = "";
}

window.searchFarmer = searchFarmer;