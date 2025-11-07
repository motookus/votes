import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, doc, setDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyAK2YMjC0F7VLXkC4tptRjuYlKCZH5kwlI",
  authDomain: "vote-81a78.firebaseapp.com",
  projectId: "vote-81a78",
  storageBucket: "vote-81a78.appspot.com",
  messagingSenderId: "780632031522",
  appId: "1:780632031522:web:9643e809d67619a00f257b",
  measurementId: "G-1YZ0HV9CGW"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM取得
const kingBtn = document.querySelector(".king-button");
const captainBtn = document.querySelector(".captain-button");
const hakaseBtn = document.querySelector(".hakase-button");

// 🔒 ロックフラグ
let locked = false;

// リアルタイム監視
function setupRealtimeListeners() {
  const refs = {
    king: doc(db, "votes", "king"),
    captain: doc(db, "votes", "captain"),
    hakase: doc(db, "votes", "hakase")
  };

  for (const [key, ref] of Object.entries(refs)) {
    const btn = document.querySelector(`.${key}-button`);
    onSnapshot(ref, (snap) => {
      const count = snap.exists() ? snap.data().count : 0;
      btn.textContent = `${btn.textContent.split(":")[0]}: ${count}`;
    });
  }
}

// 投票処理
async function vote(type) {
  if (locked) return; // すでにロック済みなら無視

  const alreadyVoted = localStorage.getItem("voted");
  if (alreadyVoted) {
    alert(`すでに ${alreadyVoted} に投票済みです！`);
    return;
  }

  // 👇 押した瞬間ロック
  locked = true;
  disableAllButtons();

  try {
    const ref = doc(db, "votes", type);
    await setDoc(ref, { count: increment(1) }, { merge: true });
    localStorage.setItem("voted", type);
    alert(`${type} に投票しました！`);
  } catch (error) {
    console.error("投票エラー:", error);
    alert("投票に失敗しました。");
  }
}

// ボタンを無効化
function disableAllButtons() {
  [kingBtn, captainBtn, hakaseBtn].forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
  });
}

// イベント登録
kingBtn.addEventListener("click", () => vote("king"));
captainBtn.addEventListener("click", () => vote("captain"));
hakaseBtn.addEventListener("click", () => vote("hakase"));

// ページ読み込み時
setupRealtimeListeners();

// すでに投票済みなら無効化
if (localStorage.getItem("voted")) {
  disableAllButtons();
  locked = true;
}
