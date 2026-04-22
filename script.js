document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const loginForm = document.getElementById('login-form');

    // 1. Проверка входа
    const savedUser = localStorage.getItem('userAccount');
    if (savedUser) {
        updateNavWithUser(savedUser);
    }

    function updateNavWithUser(username) {
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.innerHTML = `
                <div class="user-profile-nav">
                    <a href="profile.html" class="user-name-display">👤 ${username.toUpperCase()}</a>
                    <button class="logout-link" onclick="logout()">ВЫХОД</button>
                </div>
            `;
        }
    }

    window.logout = () => {
        localStorage.removeItem('userAccount');
        location.reload();
    };

    // 2. Открытие модалки (Исправлено)
    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.style.display = 'flex'; // Принудительно
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
    }

    // 3. Закрытие
    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => {
            authModal.style.display = 'none';
            authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    }

    // 4. Обработка входа + Уведомление
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('input[type="text"]').value;
            localStorage.setItem('userAccount', username);
            
            showNotification(`Привет, ${username}!`);
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        };
    }

    function showNotification(msg) {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
});

function switchForm(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');
    const underline = document.querySelector('.underline');
    underline.style.width = element.offsetWidth + 'px';
    underline.style.left = element.offsetLeft + 'px';
}
