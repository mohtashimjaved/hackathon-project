let users = JSON.parse(localStorage.getItem('users')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

const isAppPage = document.getElementById('feed');
const isLoginPage = document.getElementById('login-form');
const isSignupPage = document.getElementById('signup-form');

if (isAppPage) {
    if (!currentUser) {
        window.location.href = 'login.html';
    } else {
        initApp();
    }
}

if (isLoginPage && currentUser) {
    window.location.href = 'index.html';
}

applyTheme();

// --- LOGIN PAGE LOGIC ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        const user = users.find(u => u.email === email && u.pass === pass);

        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'index.html';
        } else {
            alert('Invalid credentials');
        }
    });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const pass = document.getElementById('signup-pass').value;

        if (users.find(u => u.email === email)) return alert('User exists!');
        users.push({ name, email, pass });
        localStorage.setItem('users', JSON.stringify(users));

        alert('Account created! Please log in.');
        window.location.href = 'login.html';
    });
}

function initApp() {
    document.getElementById('user-display-name').innerText = currentUser.name;

    document.getElementById('logout-btn').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    document.getElementById('publish-btn').addEventListener('click', () => {
        const text = document.getElementById('post-text').value;
        const imgUrl = document.getElementById('post-image-url').value;

        if (!text.trim() && !imgUrl.trim()) { 
            return alert("Empty post!"); 
        }

        posts.unshift({
            id: Date.now(),
            author: currentUser.name,
            text: text,
            image: imgUrl,
            timestamp: Date.now(),
            likes: 0,
            likedBy: []
        });

        document.getElementById('post-text').value = '';
        document.getElementById('post-image-url').value = '';
        saveAndRender();
    });

    const emojis = [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
        '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
        '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
        '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝',
        '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁',
        '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '🔥', '✨', '🌟', '💫', '💥', '💯', '💦', '💤', '🚀', '🌙'
    ];

    const emojiToggleBtn = document.getElementById('emoji-toggle-btn');
    const emojiContainer = document.getElementById('emoji-container');
    const emojiGrid = document.getElementById('emoji-grid');
    const closeEmojiBtn = document.getElementById('close-emoji-btn');
    const postText = document.getElementById('post-text');

    if (emojiToggleBtn && emojiContainer && emojiGrid) {
        emojis.forEach(emoji => {
            const span = document.createElement('span');
            span.innerText = emoji;
            span.className = 'emoji-item';
            span.onclick = () => insertEmoji(emoji);
            emojiGrid.appendChild(span);
        });

        emojiToggleBtn.addEventListener('click', () => {
            emojiContainer.classList.toggle('hidden');
        });

        closeEmojiBtn.addEventListener('click', (e) => {
            e.preventDefault();
            emojiContainer.classList.add('hidden');
        });

        function insertEmoji(emoji) {
            const start = postText.selectionStart;
            const end = postText.selectionEnd;
            const text = postText.value;
            postText.value = text.substring(0, start) + emoji + text.substring(end);
            postText.selectionStart = postText.selectionEnd = start + emoji.length;
            postText.focus();
        }
    }

    document.getElementById('search-input').addEventListener('input', renderPosts);
    document.getElementById('sort-select').addEventListener('change', renderPosts);

    renderPosts();
}

function renderPosts() {
    const feed = document.getElementById('feed');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    if (!feed) return;

    feed.innerHTML = '';
    let filtered = posts.filter(p => p.text.toLowerCase().includes(searchInput.value.toLowerCase()));

    const sort = sortSelect.value;
    if (sort === 'latest') filtered.sort((a, b) => b.timestamp - a.timestamp);
    if (sort === 'oldest') filtered.sort((a, b) => a.timestamp - b.timestamp);
    if (sort === 'most-liked') filtered.sort((a, b) => b.likes - a.likes);

    filtered.forEach(post => {
        const isLiked = post.likedBy?.includes(currentUser?.email);
        const date = new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        const el = document.createElement('div');
        el.className = 'post';
        el.innerHTML = `
            <div class="post-header">
                <div class="post-user">
                    <div class="avatar-md"><i class="fa-solid fa-user"></i></div>
                    <div class="user-info">
                        <h4>${post.author}</h4>
                        <span>${date}</span>
                    </div>
                </div>
                ${post.author === currentUser.name ? `
                <button class="icon-btn danger" onclick="deletePost(${post.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>` : ''}
            </div>
            <div class="post-content">
                <p id="text-${post.id}">${post.text}</p>
                ${post.image ? `<img src="${post.image}" class="post-img" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="post-actions">
                <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> 
                    <span style="margin-left:5px">${post.likes}</span>
                </button>
                ${post.author === currentUser.name ? `
                <button class="action-btn" onclick="editPost(${post.id})">
                    <i class="fa-solid fa-pen"></i> 
                    <span style="margin-left:5px">Edit</span>
                </button>` : ''}
            </div>
            <button id="save-${post.id}" class="btn-primary btn-md hidden" style="margin-top:15px; float:right;" onclick="saveEdit(${post.id})">Save Changes</button>
            <div style="clear:both;"></div>
        `;
        feed.appendChild(el);
    });
}
console.log(window);

window.toggleLike = (id) => {
    const post = posts.find(p => p.id === id);
    if (!post.likedBy) post.likedBy = [];

    if (post.likedBy.includes(currentUser.email)) {
        post.likes--;
        post.likedBy = post.likedBy.filter(e => e !== currentUser.email);
    } else {
        post.likes++;
        post.likedBy.push(currentUser.email);
    }
    saveAndRender();
};

window.deletePost = (id) => {
    if (confirm("Delete this post?")) {
        posts = posts.filter(p => p.id !== id);
        saveAndRender();
    }
};

window.editPost = (id) => {
    const p = document.getElementById(`text-${id}`);
    p.contentEditable = true;
    p.focus();
    p.style.border = "2px solid var(--primary)";
    p.style.padding = "10px";
    p.style.borderRadius = "8px";
    document.getElementById(`save-${id}`).classList.remove('hidden');
};

window.saveEdit = (id) => {
    const p = document.getElementById(`text-${id}`);
    const post = posts.find(item => item.id === id);
    post.text = p.innerText;
    saveAndRender();
};

function saveAndRender() {
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPosts();
}

function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.body.classList.add('dark-mode');

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        toggle.onclick = () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            applyTheme();
        };
    }
}