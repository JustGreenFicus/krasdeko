document.addEventListener('DOMContentLoaded', () => {
    // 1. ЭЛЕМЕНТЫ
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');

    // Проверка авторизации при загрузке
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
        updateNav(savedUser);
    }

    // 2. УВЕДОМЛЕНИЯ (ТОСТЫ)
    function showNotification(message) {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid fa-check"></i></div>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // 3. ОБНОВЛЕНИЕ НАВИГАЦИИ (Строгий дизайн)
    function updateNav(username) {
        // Находим контейнер, в котором лежит кнопка "Войти"
        const authContainer = openAuthBtn ? openAuthBtn.parentElement : document.getElementById('auth-section');
        
        if (authContainer) {
            // Заменяем кнопку на строгий монохромный профиль
            authContainer.innerHTML = `
                <div class="user-profile-nod">
                    <span class="user-name">${username.toUpperCase()}</span>
                    <div class="user-controls">
                        <button class="settings-btn" onclick="openSettings()">Настройки</button>
                        <button class="logout-btn" onclick="logout()">Выход</button>
                    </div>
                </div>
            `;
        }
    }

    // 4. МОБИЛЬНОЕ МЕНЮ
    if (menu && navLinks) {
        menu.onclick = (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            navLinks.classList.toggle('active');
        };
    }

    // 5. МОДАЛКА
    if (openAuthBtn && authModal && !localStorage.getItem('username')) {
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

    // 6. РЕГИСТРАЦИЯ
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = {
                username: signupForm.querySelector('input[type="text"]').value,
                email: signupForm.querySelector('input[type="email"]').value,
                password: signupForm.querySelector('input[type="password"]').value
            };

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                
                showNotification(result.message);
                if (response.ok) {
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showNotification('Ошибка сервера');
            }
        };
    }

    // 7. ВХОД
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = {
                username: loginForm.querySelector('input[type="text"]').value,
                password: loginForm.querySelector('input[type="password"]').value
            };

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('username', result.user.username);
                    showNotification('Привет, ' + result.user.username + '!');
                    updateNav(result.user.username); // Рисуем блок профиля
                    setTimeout(() => {
                        authModal.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }, 1000);
                } else {
                    showNotification(result.message);
                }
            } catch (error) {
                showNotification('Ошибка входа');
            }
        };
    }
});

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ПРОФИЛЯ ---

window.logout = function() {
    if(confirm('Выйти из системы?')) {
        localStorage.removeItem('username');
        window.location.reload(); // Перезагружаем, чтобы вернуть кнопку входа
    }
};

window.openSettings = function() {
    alert('Личный кабинет Kras Deco: Раздел находится в разработке.');
};

// --- ОСТАЛЬНОЙ ТВОЙ КОД ---

function switchForm(type, element) {
    const underline = document.querySelector('.underline');
    const targetForm = document.getElementById(type + '-form');
    if (!targetForm || !element) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    targetForm.classList.add('active');
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
}

let logoClicks = 0;
const logo = document.querySelector('.logo');

if (logo) {
    logo.addEventListener('pointerdown', (e) => {
        logoClicks++;
        
        logo.style.opacity = '0.5';
        setTimeout(() => logo.style.opacity = '1', 100);

        if (logoClicks === 3) {
            e.preventDefault(); 
            const user = localStorage.getItem('username');
            
            const statusText = user ? `В системе: ${user}` : "Вход не выполнен";
            
            if (typeof showNotification === "function") {
                showNotification(statusText);
            } else {
                alert(statusText);
            }
            
            logoClicks = 0;
        }
    });

    setInterval(() => {
        if (logoClicks > 0) logoClicks = 0;
    }, 2000);
}
