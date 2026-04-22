document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://krasdeko.onrender.com'; 

    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // 1. Проверка авторизации при загрузке
    const savedUser = JSON.parse(localStorage.getItem('userAccount'));
    if (savedUser) {
        updateNavWithUser(savedUser.username);
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
        
        // Находим нужные поля внутри текущей формы
        const usernameInput = form.querySelector('input[placeholder*="логин"]');
        const passwordInput = form.querySelector('input[type="password"]');
        const emailInput = form.querySelector('input[type="email"]');

        const formData = {
            username: usernameInput.value,
            password: passwordInput.value
        };
        
        if (endpoint === 'signup') {
            formData.email = emailInput.value;
        }

        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'ЗАГРУЗКА...';

        try {
            const response = await fetch(`${API_URL}/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем объект пользователя для profile.html
                const userObj = data.user || { username: data.username || formData.username };
                localStorage.setItem('userAccount', JSON.stringify(userObj));
                
                showNotification(`Успешно! Идем в профиль...`);
                
                // Редирект в личный кабинет через 1.2 сек
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1200);
            } else {
                showNotification(data.message || 'Ошибка');
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        } catch (error) {
            showNotification('Сервер не отвечает. Проверьте Render.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'ОШИБКА';
        }
    }

    // Привязываем события (signup вместо register)
    if (loginForm) loginForm.onsubmit = (e) => handleAuth(e, 'login');
    if (signupForm) signupForm.onsubmit = (e) => handleAuth(e, 'signup');

    // 4. Функции интерфейса
    function updateNavWithUser(username) {
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.innerHTML = `
                <div class="user-profile-nav" style="display: flex; flex-direction: column; border-left: 1px solid #c5a059; padding-left: 15px;">
                    <a href="profile.html" class="user-name-display" style="color:#fff; font-weight:bold; text-decoration:none; font-size:12px; letter-spacing:1px;">
                       <i class="fa-regular fa-circle-user"></i> ${username.toUpperCase()}
                    </a>
                    <button onclick="logout()" style="background:none; border:none; color:#ff5e5e; font-size:9px; cursor:pointer; text-align:left; padding:0; text-decoration:underline; margin-top:3px;">ВЫХОД</button>
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

// Глобальные функции (вне DOMContentLoaded)
function switchForm(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');
    const underline = document.querySelector('.underline');
    if(underline) underline.style.left = element.offsetLeft + 'px';
}

function togglePassword(inputId, icon) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Функция смены никнейма
async function updateNickname() {
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
            body: JSON.stringify({ 
                oldUsername: user.username, 
                newUsername: newUsername 
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Обновляем данные в браузере
            user.username = newUsername;
            localStorage.setItem('userAccount', JSON.stringify(user));
            
            // Обновляем текст на странице
            document.getElementById('sidebar-name').innerText = newUsername;
            showNotification("Никнейм успешно изменен!");
        } else {
            showNotification(data.message);
        }
    } catch (error) {
        showNotification("Ошибка сервера");
    }
}

// Функция смены пароля
async function updatePassword() {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('update-password').value;
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (!oldPassword || !newPassword) {
        showNotification("Заполните оба поля пароля");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/update-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: user.username, 
                oldPassword, 
                newPassword 
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification("Пароль успешно обновлен!");
            document.getElementById('old-password').value = '';
            document.getElementById('update-password').value = '';
        } else {
            showNotification(data.message);
        }
    } catch (error) {
        showNotification("Ошибка сервера");
    }
}

// Заглушка для сброса по почте
function resetPasswordEmail() {
    showNotification("Функция в разработке. Скоро добавим!");
}
