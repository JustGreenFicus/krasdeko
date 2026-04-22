document.addEventListener('DOMContentLoaded', () => {
    // ССЫЛКА НА ТВОЙ БЭКЕНД (вставь свою из Render)
    const API_URL = 'https://krasdeko.onrender.com'; 

    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // 1. Проверка авторизации при загрузке
    const savedUser = localStorage.getItem('userAccount');
    if (savedUser) {
        updateNavWithUser(savedUser);
    }

    // 2. Открытие/Закрытие модалки
    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => {
            authModal.style.display = 'none';
            authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    }

    // 3. Универсальная функция запроса к серверу
    async function handleAuth(e, endpoint) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button');
        
        // Собираем данные
        const formData = {
            username: form.querySelector('input[type="text"]').value,
            password: form.querySelector('input[type="password"]').value
        };
        if (endpoint === 'register') {
            formData.email = form.querySelector('input[type="email"]').value;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = 'ЗАГРУЗКА...';

        try {
            const response = await fetch(`${API_URL}/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Если успех
                localStorage.setItem('userAccount', data.username);
                showNotification(`Успешно! Привет, ${data.username}`);
                setTimeout(() => location.reload(), 1500);
            } else {
                // Если сервер вернул ошибку (имя занято и т.д.)
                showNotification(data.message || 'Ошибка входа');
                submitBtn.disabled = false;
                submitBtn.innerText = endpoint === 'register' ? 'SIGN UP' : 'SIGN IN';
            }
        } catch (error) {
            showNotification('Сервер не отвечает. Проверьте Render.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'ПОПРОБОВАТЬ СНОВА';
        }
    }

    // Привязываем события
    if (loginForm) loginForm.onsubmit = (e) => handleAuth(e, 'login');
    if (signupForm) signupForm.onsubmit = (e) => handleAuth(e, 'register');

    // 4. Функции интерфейса
    function updateNavWithUser(username) {
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.innerHTML = `
                <div class="user-profile-nav" style="display: flex; flex-direction: column; border-left: 1px solid #444; padding-left: 15px;">
                    <a href="profile.html" class="user-name-display" style="color:#fff; font-weight:bold; text-decoration:none; font-size:12px;">
                       <i class="fa-regular fa-user"></i> ${username.toUpperCase()}
                    </a>
                    <button onclick="logout()" style="background:none; border:none; color:#ff5e5e; font-size:10px; cursor:pointer; text-align:left; padding:0; text-decoration:underline;">ВЫХОД</button>
                </div>
            `;
        }
    }

    window.logout = () => {
        localStorage.removeItem('userAccount');
        location.reload();
    };

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

// Переключение табов в модалке
function switchForm(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');
    const underline = document.querySelector('.underline');
    underline.style.left = element.offsetLeft + 'px';
}
