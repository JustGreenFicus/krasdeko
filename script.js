// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ
const API_URL = 'https://krasdeko.onrender.com'; 

// 2. ФУНКЦИЯ УВЕДОМЛЕНИЙ (МИНИМАЛИЗМ: ЧЕРНЫЙ С РАМКОЙ)
function showNotification(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// 3. МАСКА ТЕЛЕФОНА (+7 + 10 цифр)
function applyPhoneMask(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value;
        
        // Если пусто или стерли всё, возвращаем +7
        if (!value.startsWith('+7')) {
            value = '+7';
        }

        // Берем только цифры после +7
        let digits = value.substring(2).replace(/\D/g, '');
        
        // Ограничиваем 10 цифрами
        if (digits.length > 10) {
            digits = digits.substring(0, 10);
        }
        
        e.target.value = '+7' + digits;
    });

    // Запрещаем удалять +7 через Backspace в начале
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length <= 2) {
            e.preventDefault();
        }
    });
}

// 4. ОСНОВНАЯ ЛОГИКА ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Применяем маску ко всем полям телефона
    document.querySelectorAll('input[name="phone"]').forEach(applyPhoneMask);

    // Проверка авторизации
    const savedUser = JSON.parse(localStorage.getItem('userAccount'));
    if (savedUser) updateUI(savedUser);

    // Управление модальным окном
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

    // Универсальная функция авторизации
    async function handleAuth(e, endpoint) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button');
        const formData = {};
        
        new FormData(form).forEach((value, key) => {
            // Если это вход, называем поле identifier (логин или телефон)
            if (endpoint === 'login' && key === 'username') {
                formData['identifier'] = value;
            } else {
                formData[key] = value;
            }
        });

        submitBtn.disabled = true;
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'ОБРАБОТКА...';

        try {
            const response = await fetch(`${API_URL}/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = data.user;
                localStorage.setItem('userAccount', JSON.stringify(userObj));
                showNotification(`Добро пожаловать, ${userObj.username}!`);
                authModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                updateUI(userObj);
            } else {
                showNotification(data.message || 'Ошибка доступа');
            }
        } catch (error) {
            showNotification('Ошибка связи с сервером');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }

    if (loginForm) loginForm.onsubmit = (e) => handleAuth(e, 'login');
    if (signupForm) signupForm.onsubmit = (e) => handleAuth(e, 'signup');
});

// 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateUI(user) {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <a href="#" onclick="toggleSidebar()" class="user-trigger">
                <i class="fa-regular fa-circle-user"></i> ${user.username.toUpperCase()}
            </a>
        `;
    }
    
    if (document.getElementById('display-username')) {
        document.getElementById('display-username').innerText = user.username;
        document.getElementById('display-email').innerText = user.email || 'example@mail.com';
        document.getElementById('display-phone').innerText = user.phone || '+7...';
    }
}

// 6. ЛОГИКА РЕДАКТИРОВАНИЯ
window.editField = (type) => {
    const displayElem = document.getElementById(`display-${type}`);
    if (!displayElem) return;

    const currentValue = displayElem.innerText;
    displayElem.style.display = 'none';
    displayElem.nextElementSibling.style.display = 'none'; // Скрываем иконку пера

    const editHTML = `
        <div class="edit-mode-container" style="width: 100%; display: flex; gap: 5px; margin-top: 5px;">
            <input type="${type === 'email' ? 'email' : 'text'}" id="edit-input-${type}" value="${currentValue}" 
                   style="flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 5px; outline: none;">
            <button onclick="saveEdit('${type}')" style="background: #fff; color: #000; border: none; padding: 5px 10px; cursor: pointer;"><i class="fa-solid fa-check"></i></button>
            <button onclick="cancelEdit()" style="background: #222; color: #fff; border: 1px solid #444; padding: 5px 10px; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `;

    displayElem.insertAdjacentHTML('afterend', editHTML);

    // Если редактируем телефон, сразу вешаем маску на новое поле
    if (type === 'phone') {
        applyPhoneMask(document.getElementById('edit-input-phone'));
    }
};

window.cancelEdit = () => {
    document.querySelectorAll('.edit-mode-container').forEach(el => el.remove());
    document.querySelectorAll('.field-row span, .edit-icon-btn').forEach(el => el.style.display = 'block');
};

window.saveEdit = async (type) => {
    const input = document.getElementById(`edit-input-${type}`);
    const newValue = input.value;
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (!newValue || (type === 'phone' && newValue.length < 12)) {
        showNotification("Введите корректные данные");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: user.id || user._id, 
                field: type, 
                value: newValue 
            })
        });

        if (response.ok) {
            user[type] = newValue;
            localStorage.setItem('userAccount', JSON.stringify(user));
            updateUI(user);
            showNotification("Обновлено");
            cancelEdit();
        } else {
            showNotification("Ошибка обновления");
        }
    } catch (e) {
        showNotification("Ошибка сервера");
    }
};

// СИСТЕМНЫЕ ФУНКЦИИ
window.toggleSidebar = () => {
    document.getElementById('user-sidebar').classList.toggle('active');
    document.getElementById('sidebar-overlay').classList.toggle('active');
};

window.logout = () => {
    localStorage.removeItem('userAccount');
    window.location.reload();
};

window.switchForm = (type, element) => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');
    
    const underline = document.querySelector('.underline');
    underline.style.width = element.offsetWidth + 'px';
    underline.style.left = element.offsetLeft + 'px';
};

window.togglePassword = (inputId, icon) => {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
};
