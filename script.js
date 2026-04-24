// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ
const API_URL = 'https://krasdeko.onrender.com'; 

// 2. ФУНКЦИЯ УВЕДОМЛЕНИЙ
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

// 3. ОСНОВНАЯ ЛОГИКА ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Проверка авторизации
    const savedUser = JSON.parse(localStorage.getItem('userAccount'));
    if (savedUser) {
        updateUI(savedUser);
    }

    // Модальное окно
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

    // Обработка входа и регистрации
    async function handleAuth(e, endpoint) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button');
        const formData = {};
        
        new FormData(form).forEach((value, key) => {
            formData[key] = value;
        });

        submitBtn.disabled = true;
        submitBtn.innerText = 'ОБРАБОТКА...';

        try {
            const response = await fetch(`${API_URL}/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = data.user || formData;
                localStorage.setItem('userAccount', JSON.stringify(userObj));
                showNotification(`Добро пожаловать, ${userObj.username}!`);
                authModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                updateUI(userObj);
            } else {
                showNotification(data.message || 'Ошибка данных');
            }
        } catch (error) {
            showNotification('Ошибка связи с сервером');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = endpoint === 'login' ? 'SIGN IN' : 'SIGN UP';
        }
    }

    if (loginForm) loginForm.onsubmit = (e) => handleAuth(e, 'login');
    if (signupForm) signupForm.onsubmit = (e) => handleAuth(e, 'signup');
});

// 4. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateUI(user) {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <a href="#" onclick="toggleSidebar()" class="user-trigger">
                <i class="fa-regular fa-circle-user"></i> ${user.username.toUpperCase()}
            </a>
        `;
    }
    
    // Заполняем данные в сайдбаре
    if (document.getElementById('display-username')) {
        document.getElementById('display-username').innerText = user.username;
        document.getElementById('display-email').innerText = user.email || 'Не указана';
        document.getElementById('display-phone').innerText = user.phone || 'Не указан';
    }
}

// 5. ЛОГИКА РЕДАКТИРОВАНИЯ (КАРАНДАШИК)
window.editField = (type) => {
    const displayElem = document.getElementById(`display-${type}`);
    if (!displayElem && type !== 'password') return;

    const currentValue = type === 'password' ? '' : displayElem.innerText;
    const parent = type === 'password' ? document.querySelector('.sidebar-divider').previousElementSibling : displayElem.parentElement;

    // Создаем мини-форму для редактирования
    const editHTML = `
        <div class="edit-mode-container" style="width: 100%; display: flex; gap: 5px; margin-top: 5px;">
            <input type="text" id="edit-input-${type}" value="${currentValue}" placeholder="Новое значение" 
                   style="flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 5px;">
            <button onclick="saveEdit('${type}')" style="background: #fff; color: #000; border: none; padding: 5px 10px; cursor: pointer;"><i class="fa-solid fa-check"></i></button>
            <button onclick="cancelEdit()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `;

    // Временно скрываем текущую строку и вставляем форму
    if (type !== 'password') {
        displayElem.style.display = 'none';
        displayElem.nextElementSibling.style.display = 'none'; // Скрываем карандаш
        displayElem.insertAdjacentHTML('afterend', editHTML);
    } else {
        showNotification("Для смены пароля введите данные в поля безопасности");
    }
};

window.cancelEdit = () => {
    document.querySelectorAll('.edit-mode-container').forEach(el => el.remove());
    document.querySelectorAll('.field-row span, .edit-icon-btn').forEach(el => el.style.display = 'block');
};

window.saveEdit = async (type) => {
    const newValue = document.getElementById(`edit-input-${type}`).value;
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (!newValue) {
        showNotification("Поле не может быть пустым");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: user.username, 
                field: type, 
                value: newValue 
            })
        });

        if (response.ok) {
            user[type] = newValue;
            localStorage.setItem('userAccount', JSON.stringify(user));
            updateUI(user);
            showNotification("Данные обновлены");
            cancelEdit();
        } else {
            showNotification("Ошибка при обновлении");
        }
    } catch (e) {
        showNotification("Ошибка сервера");
    }
};

// СТАНДАРТНЫЕ ФУНКЦИИ
window.toggleSidebar = () => {
    const sidebar = document.getElementById('user-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
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
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
};
