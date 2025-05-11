import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { deleteDoc, doc as firestoreDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";


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

async function deleteComment(id) {
    await deleteDoc(firestoreDoc(db, "comments", id));
    loadComments(); // 삭제 후 목록 다시 로드
}
// 댓글 추가

let isSubmitting = false; // 함수 바깥에 선언 (최초 한 번만)

async function addComment() {
    if (isSubmitting) return; // 이미 제출 중이면 무시
    isSubmitting = true;

    const input = document.getElementById("commentInput");
    const comment = input.value.trim();

    if (comment) {
        await addDoc(collection(db, "comments"), {
            text: comment,
            createdAt: new Date()
        });
        input.value = "";
        await loadComments(); // 댓글 다시 불러오기
    }

    isSubmitting = false; // 다시 댓글 입력 가능하게
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

    // 🔽 createdAt 기준으로 최신순 정렬
    const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");

        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

        // 댓글 텍스트와 시간
        const commentText = document.createElement("span");
        commentText.textContent = `${data.text} (${timeAgo(createdAt)})`;

        // ❌ 삭제 버튼
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.onclick = async () => {
            await deleteComment(doc.id);
        };

        li.appendChild(commentText);
        li.appendChild(deleteBtn);
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