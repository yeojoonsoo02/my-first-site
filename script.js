import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
import {
    getFirestore, collection, addDoc, getDocs, query,
    orderBy, deleteDoc, doc as firestoreDoc, updateDoc,
    increment, getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
const foodData = [
    { name: "닭가슴살", calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    { name: "계란", calories: 75, protein: 6, fat: 5, carbs: 1 },
    { name: "바나나", calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
    { name: "밥", calories: 130, protein: 2.7, fat: 0.3, carbs: 28 }
];

// 방문자 카운트
async function incrementVisitCount() {
    const countRef = firestoreDoc(db, "counters", "visits");

    try {
        await updateDoc(countRef, {
            count: increment(1)
        });

        const snapshot = await getDoc(countRef);
        const count = snapshot.data().count;

        const el = document.getElementById("visitCount");
        if (el) el.textContent = `👀 총 방문자 수: ${count}`;
    } catch (err) {
        console.error("방문자 수 업데이트 실패:", err);
    }
}

// 댓글 좋아요 싫어요 기능
async function updateLike(id, field) {
    const commentRef = firestoreDoc(db, "comments", id);
    await updateDoc(commentRef, {
        [field]: increment(1)
    });
    loadComments();
}

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
            createdAt: new Date(),
            likes: 0,
            dislike: 0
        });
        input.value = "";
        await loadComments(); // 댓글 다시 불러오기
    }

    isSubmitting = false; // 다시 댓글 입력 가능하게
}
// 자동 추천 함수
document.getElementById("foodInput").addEventListener("input", function () {
    const input = this.value.toLowerCase();
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";

    if (input.length === 0) return;

    const filtered = foodData.filter(food =>
        food.name.includes(input)
    );

    filtered.forEach(food => {
        const li = document.createElement("li");
        li.textContent = food.name;
        li.style.cursor = "pointer";
        li.onclick = () => showFoodInfo(food);
        suggestions.appendChild(li);
    });
});

function showFoodInfo(food) {
    const info = `
    <h2>${food.name}</h2>
    <p>칼로리: ${food.calories} kcal</p>
    <p>단백질: ${food.protein}g</p>
    <p>지방: ${food.fat}g</p>
    <p>탄수화물: ${food.carbs}g</p>
  `;
    document.getElementById("selectedFoodInfo").innerHTML = info;
    document.getElementById("suggestions").innerHTML = "";
}

function toggleComments() {
    const list = document.getElementById("commentList");
    const btn = document.getElementById("toggleBtn");

    if (list.style.display === "none") {
        list.style.display = "block";
        btn.textContent = "댓글 숨기기";
    } else {
        list.style.display = "none";
        btn.textContent = "댓글 보기";
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

        // 좋아요 버튼
        const likeBtn = document.createElement("button");
        likeBtn.textContent = `👍 ${data.likes ?? 0}`;
        likeBtn.style.marginLeft = "10px";
        likeBtn.onclick = async () => {
            await updateLike(doc.id, "likes");
        };

        // 싫어요 버튼
        const dislikeBtn = document.createElement("button");
        dislikeBtn.textContent = `👎 ${data.dislikes ?? 0}`;
        dislikeBtn.style.marginLeft = "5px";
        dislikeBtn.onclick = async () => {
            await updateLike(doc.id, "dislikes");
        };

        li.appendChild(commentText);
        li.appendChild(likeBtn);
        li.appendChild(dislikeBtn);
        li.appendChild(deleteBtn); // 이미 있던 ❌ 버튼
        li.title = createdAt.toLocaleString();

        list.appendChild(li);
    });
}
window.onload = () => {
    loadComments();
    incrementVisitCount();
    document.getElementById("commentList").style.display = "none";
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
window.toggleComments = toggleComments;