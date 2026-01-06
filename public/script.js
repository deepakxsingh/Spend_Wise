import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDSWxXbMV1tUNICAZmqCImdbAchOLfbido",
  authDomain: "spendwise-a9795.firebaseapp.com",
  projectId: "spendwise-a9795",
  storageBucket: "spendwise-a9795.firebasestorage.app",
  messagingSenderId: "126424935390",
  appId: "1:126424935390:web:167f22ecdb341ae3258b4f",
  measurementId: "G-B9VHP8DGBC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let expenses = [];
let currentUser = null;

// DOM Elements
const form = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const emptyState = document.getElementById('emptyState');
const totalDisplay = document.getElementById('totalAmount');
const categoryBreakdown = document.getElementById('categoryBreakdown');
const categoryList = document.getElementById('categoryList');

const categoryConfig = {
    'Food': { icon: 'fa-burger', color: '#ea580c' },
    'Travel': { icon: 'fa-bus', color: '#2563eb' },
    'Shopping': { icon: 'fa-bag-shopping', color: '#16a34a' },
    'Other': { icon: 'fa-box', color: '#4b5563' }
};

// --- 2. AUTH STATE & DATA FETCHING ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        // Sirf is user ka data mangwao (Security filter)
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        
        onSnapshot(q, (snapshot) => {
            expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateUI();
        });
    } else {
        window.location.href = "index.html";
    }
});

// --- 3. ADD EXPENSE (WITH USER NAME & EMAIL) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // Yahan humne userName aur userEmail add kiya hai
    const newExpense = {
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        note: document.getElementById('note').value,
        uid: currentUser.uid,               // User ID (for security)
        userName: currentUser.displayName,  // User ka Google wala naam
        userEmail: currentUser.email,       // User ki email ID
        timestamp: Date.now()               // Kis time add kiya
    };

    try {
        await addDoc(collection(db, "expenses"), newExpense);
        form.reset();
        document.getElementById('date').valueAsDate = new Date();
    } catch (err) {
        console.error("Error adding expense:", err);
        alert("Failed to save data. Please check connection.");
    }
});

// --- 4. DELETE EXPENSE ---
window.deleteExpense = async (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
        try {
            await deleteDoc(doc(db, "expenses", id));
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }
};

// --- 5. UI UPDATING FUNCTIONS ---
function updateUI() {
    renderList();
    updateTotal();
    updateCategories();
}

function renderList() {
    expenseList.innerHTML = '';
    if (expenses.length === 0) {
        emptyState.style.display = 'flex';
        categoryBreakdown.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        categoryBreakdown.style.display = 'block';

        // Sorting manually (Newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        expenses.forEach(exp => {
            const config = categoryConfig[exp.category];
            const div = document.createElement('div');
            div.className = 'expense-item';
            div.innerHTML = `
                <div class="expense-icon icon-${exp.category}">
                    <i class="fa-solid ${config.icon}"></i>
                </div>
                <div class="expense-details">
                    <div>
                        <span class="expense-amount">₹${exp.amount}</span>
                        <span class="expense-badge">${exp.category}</span>
                    </div>
                    <span class="expense-date">${exp.date}</span>
                </div>
                <div class="expense-note">${exp.note}</div>
                <button class="delete-btn" onclick="deleteExpense('${exp.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            expenseList.appendChild(div);
        });
    }
}

function updateTotal() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalDisplay.textContent = `₹${total}`;
}

function updateCategories() {
    categoryList.innerHTML = '';
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const breakdown = {};
    expenses.forEach(exp => breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount);

    for (const [cat, amount] of Object.entries(breakdown)) {
        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
        const config = categoryConfig[cat];
        categoryList.innerHTML += `
            <div class="cat-item">
                <div class="cat-header">
                    <span><i class="fa-solid ${config.icon}" style="color: ${config.color}"></i> ${cat}</span>
                    <span>₹${amount} (${percentage}%)</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${percentage}%; background-color: ${config.color}"></div></div>
            </div>`;
    }
}