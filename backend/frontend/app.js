const API = "http://localhost:5000/api";
let token = localStorage.getItem("token");
let selectedPostId = null;

/* ------------------ DARK MODE LOGIC ------------------ */
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
    if (window.location.pathname.includes("dashboard.html")) {
        if (!token) window.location.href = "login.html";
        loadPosts();
    }
});

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
}

/* ------------------ REGISTER ------------------ */
async function registerUser() {
    const body = {
        username: document.getElementById("reg-username").value,
        email: document.getElementById("reg-email").value,
        password: document.getElementById("reg-password").value
    };

    let res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    let data = await res.json();

    if (data.token) {
        alert("Registration successful! Login now.");
        window.location.href = "login.html";
    } else {
        alert("Registration failed");
    }
}

/* ------------------ LOGIN ------------------ */
async function loginUser() {
    const body = {
        email: document.getElementById("log-email").value,
        password: document.getElementById("log-password").value
    };

    let res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    let data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
    } else {
        alert("Login failed");
    }
}

/* ------------------ CREATE POST ------------------ */
async function createPost() {
    const body = {
        title: document.getElementById("post-title").value,
        content: document.getElementById("post-content").value
    };

    await fetch(`${API}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    loadPosts();
}

/* ------------------ LOAD POSTS ------------------ */
async function loadPosts() {
    let res = await fetch(`${API}/posts`);
    let posts = await res.json();

    const container = document.getElementById("posts-list");
    container.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post-item";
        div.innerHTML = `<strong>${post.title}</strong><br>${post.content.substring(0,60)}...`;
        div.onclick = () => openPost(post);
        container.appendChild(div);
    });
}

/* ------------------ OPEN POST ------------------ */
function openPost(post) {
    selectedPostId = post._id;

    document.getElementById("single-post-title").innerText = post.title;
    document.getElementById("single-post-content").innerText = post.content;

    document.getElementById("single-post-section").classList.remove("hidden");
    loadComments();
}

/* ------------------ CLOSE POST ------------------ */
function closePost() {
    document.getElementById("single-post-section").classList.add("hidden");
}

/* ------------------ DELETE POST ------------------ */
async function deletePost() {
    if (!confirm("Are you sure you want to delete this post?")) return;

    await fetch(`${API}/posts/${selectedPostId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    alert("Post deleted!");
    selectedPostId = null;
    closePost();
    loadPosts();
}

/* ------------------ COMMENTS ------------------ */
async function loadComments() {
    let res = await fetch(`${API}/comments?postId=${selectedPostId}`);
    let comments = await res.json();

    const box = document.getElementById("comment-list");
    box.innerHTML = "";

    comments.forEach(c => {
        const div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = `<strong>${c.author?.username || "User"}:</strong> ${c.content}`;
        box.appendChild(div);
    });
}

async function addComment() {
    const body = {
        postId: selectedPostId,
        content: document.getElementById("comment-input").value
    };

    await fetch(`${API}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    document.getElementById("comment-input").value = "";
    loadComments();
}

/* ------------------ LOGOUT ------------------ */
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
