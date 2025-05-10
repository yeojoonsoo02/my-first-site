import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCnLZrxMK0P4uHZL8KxfsVAGKSKVscCKqo",
    authDomain: "my-first-site-e9210.firebaseapp.com",
    projectId: "my-first-site-e9210",
    storageBucket: "my-first-site-e9210.firebasestorage.app",
    messagingSenderId: "675684570102",
    appId: "1:675684570102:web:1ff05925fa006eb8a9add7",
    measurementId: "G-WP4NKWHDQ0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 댓글 추가
async function addComment() {
    const input = document.getElementById("commentInput");
    const comment = input.value.trim();
    if (comment) {
        await addDoc(collection(db, "comments"), {
            text: comment,
            createdAt: new Date()
        });
        input.value = "";
        loadComments();
    }
}
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}초 전`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
}
// 댓글 불러오기
async function loadComments() {
    const list = document.getElementById("commentList");
    list.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "comments"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");

        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

        li.textContent = `${data.text} (${timeAgo(createdAt)})`;
        li.title = createdAt.toLocaleString();

        list.appendChild(li);
    });
}
window.onload = () => {
    loadComments();
};
document.getElementById("commentInput").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        addComment();
    }
});

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

window.addComment = addComment;
window.loadComments = loadComments;
window.toggleDarkMode = toggleDarkMode;