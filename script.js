// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ
const API_URL = 'https://krasdeko.onrender.com'; 

// 2. ФУНКЦИЯ УВЕДОМЛЕНИЙ (МИНИМАЛИЗМ)
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

// 3. УЛУЧШЕННАЯ МАСКА ТЕЛЕФОНА (СТЕНА + ТИРЕ)
function applyPhoneMask(input) {
    const mask = (value) => {
        if (!value.startsWith('+7')) value = '+7' + value.replace(/\D/g, '');
        
        let digits = value.substring(2).replace(/\D/g, '');
        if (digits.length > 10) digits = digits.substring(0, 10);

        let res = '+7';
        if (digits.length > 0) res += ' ' + digits.substring(0, 3);
        if (digits.length >= 4) res += '-' + digits.substring(3, 6);
        if (digits.length >= 7) res += '-' + digits.substring(6, 8);
        if (digits.length >= 9) res += '-' + digits.substring(8, 10);
        
        return res;
    };

    input.addEventListener('input', (e) => {
        const cursor = e.target.selectionStart;
        const oldVal = e.target.value;
        e.target.value = mask(e.target.value);
        
        // Не даем курсору прыгать назад за +7
        if (cursor <= 2) e.target.setSelectionRange(3, 3);
    });

    input.addEventListener('keydown', (e) => {
        // Блокируем Backspace, если курсор на границе +7
        if (e.key === 'Backspace' && input.selectionStart <= 3) {
            e.preventDefault();
        }
    });

    input.addEventListener('click', () => {
        // При клике в начало — прыгаем за префикс
        if (input.selectionStart < 3) {
            input.setSelectionRange(input.value.length, input.value.length);
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

    document.querySelectorAll('input[name="phone"]').forEach(applyPhoneMask);

    const savedUser = JSON.parse(localStorage.getItem('userAccount'));
    if (savedUser) updateUI(savedUser);

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

    async function handleAuth(e, endpoint) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button');
        const formData = {};
        
        new FormData(form).forEach((value, key) => {
            formData[key] = (key === 'username' && endpoint === 'login') ? value : value;
            if (endpoint === 'login' && key === 'username') formData['identifier'] = value;
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
                localStorage.setItem('userAccount', JSON.stringify(data.user));
                showNotification(`Добро пожаловать!`);
                authModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                updateUI(data.user);
            } else {
                showNotification(data.message || 'Ошибка');
            }
        } catch (error) {
            showNotification('Ошибка сервера');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = endpoint === 'login' ? 'SIGN IN' : 'SIGN UP';
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
        document.getElementById('display-email').innerText = user.email || 'Не указана';
        document.getElementById('display-phone').innerText = user.phone || '+7...';
    }
}

// 6. ЛОГИКА РЕДАКТИРОВАНИЯ
window.editField = (type) => {
    const displayElem = document.getElementById(`display-${type}`);
    if (!displayElem) return;

    const currentValue = displayElem.innerText;
    displayElem.style.display = 'none';
    displayElem.nextElementSibling.style.display = 'none'; 

    const editHTML = `
        <div class="edit-mode-container" style="width: 100%; display: flex; gap: 5px; margin-top: 5px;">
            <input type="${type === 'email' ? 'email' : 'text'}" id="edit-input-${type}" value="${currentValue}" 
                   style="flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 5px; outline: none;">
            <button onclick="saveEdit('${type}')" style="background: #fff; color: #000; border: none; padding: 5px 10px; cursor: pointer;"><i class="fa-solid fa-check"></i></button>
            <button onclick="cancelEdit()" style="background: #222; color: #fff; border: 1px solid #444; padding: 5px 10px; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `;

    displayElem.insertAdjacentHTML('afterend', editHTML);

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

    if (!newValue) {
        showNotification("Заполните поле");
        return;
    }

    // Ищем ID в разных возможных полях (id или _id)
    const userId = user._id || user.id;

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: userId, 
                field: type, 
                value: newValue 
            })
        });

        const data = await response.json();

        if (response.ok) {
            user[type] = newValue;
            localStorage.setItem('userAccount', JSON.stringify(user));
            updateUI(user);
            showNotification("Данные обновлены");
            cancelEdit();
        } else {
            showNotification(data.message || "Ошибка обновления");
        }
    } catch (e) {
        showNotification("Ошибка связи с сервером");
    }
};

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
