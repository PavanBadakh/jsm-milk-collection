import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2cnWWzYeSNpva3As5apvIo3O_6Ub87gY",
  authDomain: "jsm-milk-collection.firebaseapp.com",
  projectId: "jsm-milk-collection",
  storageBucket: "jsm-milk-collection.firebasestorage.app",
  messagingSenderId: "446366555120",
  appId: "1:446366555120:web:3f5428eb0893b7b8bcfcd5",
  measurementId: "G-TFQMP963JV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getTodayDate() {
  // Local date, not UTC, so entries near midnight use the local calendar date.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readForm() {
  return {
    farmerNo: document.getElementById("farmerNo").value.trim(),
    name: document.getElementById("name").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    litre: document.getElementById("litre").value.trim(),
    fat: document.getElementById("fat").value.trim(),
    degree: document.getElementById("degree").value.trim(),
    session: document.getElementById("session").value,
    date: getTodayDate()
  };
}

function getWhatsAppNumber(mobile) {
  let digits = (mobile || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = "91" + digits;
  return digits;
}

function makeWhatsAppMessage(data) {
  return `*Jay Shree Mataji Milk Collection Bherdapur*

नमस्कार ${data.name}!

तुमच्या आजच्या दूध संकलनाची माहिती:

Date: ${data.date}
Litre: ${data.litre}
Fat: ${data.fat}
Degree: ${data.degree}
Session: ${data.session === "morning" ? "Morning" : "Evening"}

मागील Records पाहण्यासाठी Website ला भेट द्या:
https://pavanbadakh.github.io/jsm-milk-collection/

धन्यवाद!`;
}

async function storeEntry(data) {
  if (!data.farmerNo) throw new Error("Please enter Farmer No.");
  if (!data.name) throw new Error("Please enter Farmer Name.");
  if (!data.mobile) throw new Error("Please enter Mobile Number.");
  const number = getWhatsAppNumber(data.mobile);
  if (number.length < 12 || number.length > 13) {
    throw new Error("Enter a valid 10-digit Indian mobile number (or include country code 91).");
  }

  await setDoc(doc(db, "farmers", data.farmerNo), {
    name: data.name,
    mobile: data.mobile
  }, { merge: true });

  await setDoc(doc(db, "farmers", data.farmerNo, "records", data.date + "_" + data.session), {
    litre: data.litre,
    fat: data.fat,
    degree: data.degree
  });

  document.getElementById("msg").textContent = "Data Saved Successfully";
}

function clearEntryFields() {
  document.getElementById("farmerNo").value = "";
  document.getElementById("name").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("litre").value = "";
  document.getElementById("fat").value = "";
  document.getElementById("degree").value = "";
  document.getElementById("session").value = "morning";
  document.getElementById("farmerNo").focus();
}

async function getFarmerName() {
  const farmerNo = document.getElementById("farmerNo").value.trim();
  if (!farmerNo) return;
  try {
    const snap = await getDoc(doc(db, "farmers", farmerNo));
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("name").value = data.name || "";
      document.getElementById("mobile").value = data.mobile || "";
    }
  } catch (error) {
    console.error(error);
    alert("Could not load farmer details. Check Firebase permissions and connection.");
  }
}

async function saveFarmer() {
  const data = readForm();
  try {
    await storeEntry(data);
    alert("Data Saved Successfully");
    clearEntryFields();
  } catch (error) {
    console.error(error);
    alert(error.message || "Could not save data. Check Firebase permissions and connection.");
  }
}

async function saveAndWhatsApp() {
  const data = readForm();
  const number = getWhatsAppNumber(data.mobile);
  if (!data.farmerNo || !data.name || !data.mobile) {
    alert("Please enter Farmer No, Name and Mobile Number first.");
    return;
  }
  if (number.length < 12 || number.length > 13) {
    alert("Enter a valid 10-digit Indian mobile number (or include country code 91).");
    return;
  }

  // Open a tab immediately so the browser is less likely to block the WhatsApp window.
  const waWindow = window.open("about:blank", "_blank");
  try {
    await storeEntry(data);
    const url = `https://wa.me/${number}?text=${encodeURIComponent(makeWhatsAppMessage(data))}`;
    if (waWindow) {
      waWindow.location.href = url;
    } else {
      window.location.href = url;
    }
    clearEntryFields();
  } catch (error) {
    if (waWindow) waWindow.close();
    console.error(error);
    alert(error.message || "Could not save data. Check Firebase permissions and connection.");
  }
}

async function loadRecord() {
  const farmerNo = document.getElementById("farmerNo").value.trim();
  const date = prompt("Enter date (YYYY-MM-DD):", getTodayDate());
  if (!farmerNo || !date) return;
  const session = document.getElementById("session").value;
  try {
    const snap = await getDoc(doc(db, "farmers", farmerNo, "records", date + "_" + session));
    if (!snap.exists()) {
      alert("Record Not Found");
      return;
    }
    const data = snap.data();
    document.getElementById("litre").value = data.litre || "";
    document.getElementById("fat").value = data.fat || "";
    document.getElementById("degree").value = data.degree || "";
    alert("Record Loaded");
  } catch (error) {
    console.error(error);
    alert("Could not load record. Check Firebase permissions and connection.");
  }
}

async function deleteRecord() {
  const farmerNo = document.getElementById("farmerNo").value.trim();
  const date = prompt("Enter date (YYYY-MM-DD):", getTodayDate());
  if (!farmerNo || !date) return;
  const session = document.getElementById("session").value;
  if (!confirm("Are you sure you want to delete this record?")) return;
  try {
    await deleteDoc(doc(db, "farmers", farmerNo, "records", date + "_" + session));
    alert("Record Deleted");
    document.getElementById("litre").value = "";
    document.getElementById("fat").value = "";
    document.getElementById("degree").value = "";
  } catch (error) {
    console.error(error);
    alert("Could not delete record. Check Firebase permissions and connection.");
  }
}

window.saveFarmer = saveFarmer;
window.saveAndWhatsApp = saveAndWhatsApp;
window.loadRecord = loadRecord;
window.deleteRecord = deleteRecord;
window.getFarmerName = getFarmerName;
