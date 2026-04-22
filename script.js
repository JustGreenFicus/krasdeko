document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');

    const savedUser = localStorage.getItem('username');
    if (savedUser) { updateNav(savedUser); }

    function showNotification(message) {
        let container = document.querySelector('.notification-container') || document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 4000);
    }

    function updateNav(username) {
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.innerHTML = `
                <div class="user-profile-nod">
                    <span class="user-name">👤 ${username.toUpperCase()}</span>
                    <div class="user-controls">
                        <button class="settings-btn" onclick="window.openSettings()">ОПЦИИ</button>
                        <button class="logout-btn" onclick="window.logout()">ВЫХОД</button>
                    </div>
                </div>
            `;
        }
    }

    // Твои обработчики меню и модалки
    if (menu) menu.onclick = () => { menu.classList.toggle('open'); navLinks.classList.toggle('active'); };
    if (openAuthBtn && !localStorage.getItem('username')) {
        openAuthBtn.onclick = (e) => { e.preventDefault(); authModal.classList.add('active'); };
    }
    if (closeAuthBtn) closeAuthBtn.onclick = () => authModal.classList.remove('active');

    // Формы регистрации и входа (как у тебя)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('input[type="text"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await response.json();
                if (response.ok) {
                    localStorage.setItem('username', result.user.username);
                    updateNav(result.user.username);
                    authModal.classList.remove('active');
                    showNotification('Привет, ' + result.user.username);
                } else { showNotification(result.message); }
            } catch (err) { showNotification('Ошибка сети'); }
        };
    }
    
    // Добавь сюда свой signupForm.onsubmit (он такой же по логике)
});

window.logout = () => { localStorage.clear(); location.reload(); };
window.openSettings = () => alert('Настройки в разработке');

function switchForm(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');
    const underline = document.querySelector('.underline');
    underline.style.width = element.offsetWidth + 'px';
    underline.style.left = element.offsetLeft + 'px';
}
