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

let box =
document.getElementById("details_" + date);

if(box.innerHTML !== ""){

box.innerHTML = "";
return;

}

let data = window.groupedData[date];

let html = "";

if(data.morning){

html += `
<p>🌅 Morning</p>
<p> Litre :${data.morning.litre}</p>
<p> Fat: ${data.morning.fat}</p>
<p> Degree: ${data.morning.degree}</p>
`;
}

if(data.evening){

html += `
<p>🌙 Evening</p>
<p> Litre: ${data.evening.litre}</p>
<p> Fat: ${data.evening.fat}</p>
<p> Degree: ${data.evening.degree}</p>
`;
}

box.innerHTML = html;

}

window.showDate = showDate;

window.showDate = showDate;
async function searchFarmer() {

    let farmerNo =
    document.getElementById("farmerNo").value;

    if (!farmerNo) {
        document.getElementById("result").innerHTML = "Please enter Farmer Number";
        return;
    }

    window.currentFarmerNo = farmerNo;
    const farmerRef = doc(db, "farmers", farmerNo);
    const farmerSnap = await getDoc(farmerRef);

    if (!farmerSnap.exists()) {
        document.getElementById("result").innerHTML = "Farmer Not Found";
        return;
    }

    const recordsRef = collection(db, "farmers", farmerNo, "records");
    const recordsSnap = await getDocs(recordsRef);

    const data = farmerSnap.data();
window.currentFarmerName = data.name || "";

let html = `
<h2 class="farmer-name">
 ${data.name.toUpperCase()}
</h2>
`;

let records = [];

recordsSnap.forEach((record) => {
    records.push({
        id: record.id,
        data: record.data()
    });
});

// Keep every record for the date-range bill before limiting History to 10 entries.
window.allFarmerRecords = records.map(record => ({
    id: record.id,
    data: record.data
}));

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

<h2> Latest Entry</h2>
<p>${latestDate}</p>
`;

if(latest.morning){

html += `
<h3>🌅 Morning</h3>

<p> Litre: ${latest.morning.litre}</p>
<p> Fat: ${latest.morning.fat}</p>
<p> Degree: ${latest.morning.degree}</p>
`;
}

if(latest.evening){

html += `
<h3>🌙 Evening</h3>

<p> Litre :${latest.evening.litre}</p>
<p> Fat: ${latest.evening.fat}</p>
<p> Degree: ${latest.evening.degree}</p>
`;
}

html += `</div>`;

html += `
<button type="button" onclick="openBill()">🧾 Bill</button>
<div id="billArea"></div>
<h3>📚 History</h3>


`;

for(let i=1;i<dates.length;i++){

html += `
<div class="card">

<div
onclick="showDate('${dates[i]}')"
style="cursor:pointer;font-weight:bold;">

▶ ${dates[i]}

</div>

<div id="details_${dates[i]}"></div>

</div>
`;
}

    document.getElementById("result").innerHTML = html;
    
    document.getElementById("farmerNo").value = "";
    document.getElementById("footer").style.display = "block";
}

window.searchFarmer = searchFarmer;

window.openBill = function () {
  const area = document.getElementById("billArea");
  area.innerHTML = `
    <section class="bill-controls">
      <h2>Jay Shree Mataji Milk Collection Bherdapur</h2>
      <h3>Milk Collection Bill</h3>
      <p><b>Farmer No:</b> ${window.currentFarmerNo} &nbsp; <b>Name:</b> ${String(window.currentFarmerName || "").toUpperCase()}</p>
      <label>From Date: <input type="date" id="billFrom"></label>
      <label>To Date: <input type="date" id="billTo"></label>
      <button type="button" onclick="showBillRecords()">View Bill</button>
      <div id="billResults"></div>
    </section>`;
};

window.showBillRecords = function () {
  const from = document.getElementById("billFrom").value;
  const to = document.getElementById("billTo").value;
  const out = document.getElementById("billResults");
  if (!from || !to || from > to) { out.innerHTML = "Please select a valid date range."; return; }
  const rows = (window.allFarmerRecords || []).map(r => {
    const split = r.id.split("_");
    return { date: split[0], session: split[1] || "", data: r.data };
  }).filter(r => r.date >= from && r.date <= to).sort((a,b) => (a.date + a.session).localeCompare(b.date + b.session));
  if (!rows.length) { out.innerHTML = "No records found for this date range."; return; }
  let html = `<table class="bill-table"><thead><tr><th>Date</th><th>Session</th><th>Litre</th><th>Fat</th><th>Degree</th><th>Rate (₹/Litre)</th></tr></thead><tbody>`;
  for (const r of rows) html += `<tr><td>${r.date}</td><td>${r.session}</td><td>${r.data.litre ?? "—"}</td><td>${r.data.fat ?? "—"}</td><td>${r.data.degree ?? "—"}</td><td>—</td></tr>`;
  html += `</tbody></table><br><button type="button" onclick="window.print()">🖨️ Print Bill</button>`;
  out.innerHTML = html;
};
