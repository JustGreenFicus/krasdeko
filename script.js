// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ
const API_URL = 'https://krasdeko.onrender.com'; 

// 2. ФУНКЦИЯ УВЕДОМЛЕНИЙ (Монохромный стиль)
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

// 3. ОСНОВНАЯ ЛОГИКА
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Проверка авторизации при загрузке страницы
    const savedUser = JSON.parse(localStorage.getItem('userAccount'));
    if (savedUser) {
        updateNavWithUser(savedUser.username);
    }

    // Модальное окно (Вход/Регистрация)
    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => {
            authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    }

    // Обработка AUTH (Вход и Регистрация)
    async function handleAuth(e, endpoint) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button');
        
        const usernameInput = form.querySelector('input[name="username"]');
        const passwordInput = form.querySelector('input[name="password"]');
        const emailInput = form.querySelector('input[name="email"]');

        const formData = {
            username: usernameInput.value,
            password: passwordInput.value
        };
        
        if (endpoint === 'signup') {
            formData.email = emailInput.value;
        }

        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'ОБРАБОТКА...';

        try {
            const response = await fetch(`${API_URL}/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = data.user || { username: data.username || formData.username };
                localStorage.setItem('userAccount', JSON.stringify(userObj));
                
                showNotification(`Добро пожаловать, ${userObj.username}!`);
                
                // Закрываем модалку и обновляем UI без перезагрузки
                authModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                updateNavWithUser(userObj.username);
            } else {
                showNotification(data.message || 'Ошибка доступа');
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        } catch (error) {
            showNotification('Ошибка связи с сервером');
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    }

    if (loginForm) loginForm.onsubmit = (e) => handleAuth(e, 'login');
    if (signupForm) signupForm.onsubmit = (e) => handleAuth(e, 'signup');
});

// 4. УПРАВЛЕНИЕ UI И САЙДБАРОМ

function updateNavWithUser(username) {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <a href="#" onclick="toggleSidebar()" class="user-trigger">
                <i class="fa-regular fa-circle-user"></i> ${username.toUpperCase()}
            </a>
        `;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('user-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// 5. ГЛОБАЛЬНЫЕ ФУНКЦИИ ПРОФИЛЯ (Сайдбар)

window.logout = () => {
    localStorage.removeItem('userAccount');
    window.location.reload(); // Полная перезагрузка для сброса состояния
};

window.updateUsername = async () => {
    const newUsername = document.getElementById('new-username').value;
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (!newUsername || newUsername === user.username) {
        showNotification("Введите новое имя");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/update-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldUsername: user.username, newUsername: newUsername })
        });

        if (response.ok) {
            user.username = newUsername;
            localStorage.setItem('userAccount', JSON.stringify(user));
            updateNavWithUser(newUsername);
            showNotification("Имя изменено");
        } else {
            const data = await response.json();
            showNotification(data.message);
        }
    } catch (e) { showNotification("Ошибка сервера"); }
};

window.updatePassword = async () => {
    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('new-password').value;
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (!oldPass || !newPass) {
        showNotification("Заполните все поля");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/update-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, oldPassword: oldPass, newPassword: newPass })
        });

        if (response.ok) {
            showNotification("Пароль обновлен");
            document.getElementById('old-password').value = '';
            document.getElementById('new-password').value = '';
        } else {
            const data = await response.json();
            showNotification(data.message);
        }
    } catch (e) { showNotification("Ошибка сервера"); }
};

// Переключение табов в модалке
window.switchForm = (type, element) => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');
    
    const underline = document.querySelector('.underline');
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
};

window.togglePassword = (inputId, icon) => {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
};

window.handleForgotPassword = () => {
    showNotification("Ссылка для восстановления отправлена на почту");
};
