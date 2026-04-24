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

// 3. МАСКА ТЕЛЕФОНА (ФИКС КУРСОР)
function applyPhoneMask(input) {
    if (!input) return;
    const prefix = '+7 ';

    const formatValue = (val) => {
        let d = val.replace(/\D/g, '');
        if (d.startsWith('7') || d.startsWith('8')) d = d.substring(1);
        d = d.substring(0, 10);
        let res = prefix;
        if (d.length > 0) res += '(' + d.substring(0, 3);
        if (d.length >= 4) res += ') ' + d.substring(3, 6);
        if (d.length >= 7) res += '-' + d.substring(6, 8);
        if (d.length >= 9) res += '-' + d.substring(8, 10);
        return res;
    };

    const fixCursor = () => {
        setTimeout(() => {
            input.setSelectionRange(input.value.length, input.value.length);
        }, 10);
    };

    input.addEventListener('input', (e) => {
        if (!e.target.value.startsWith(prefix)) e.target.value = prefix;
        e.target.value = formatValue(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.selectionStart <= 3) e.preventDefault();
    });

    input.addEventListener('click', fixCursor);
    input.addEventListener('focus', fixCursor);
}

// 4. ОСНОВНАЯ ЛОГИКА
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
            if (key === 'phone') formData[key] = value.replace(/\D/g, '');
            else if (endpoint === 'login' && key === 'username') formData['identifier'] = value;
            else formData[key] = value;
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
                updateUI(data.user);
                authModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                showNotification(`Добро пожаловать!`);
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

// 5. ОБНОВЛЕНИЕ UI (БЕЗ УДАЛЕНИЯ КНОПОК РЕДАКТИРОВАНИЯ)
function updateUI(user) {
    if (!user) return;
    
    // Ник в хедере
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        const formattedName = user.username ? user.username.toUpperCase() : 'ВОЙТИ';
        authSection.innerHTML = `
            <a href="#" onclick="event.preventDefault(); toggleSidebar();" class="user-trigger">
                <i class="fa-regular fa-circle-user"></i> ${formattedName}
            </a>
        `;
    }

    // Ник в сайдбаре (только текст!)
    const displayUser = document.getElementById('display-username');
    if (displayUser) displayUser.innerText = user.username;

    // Почта
    const displayEmail = document.getElementById('display-email');
    if (displayEmail) displayEmail.innerText = user.email || 'Не указана';

    // Телефон
    const displayPhone = document.getElementById('display-phone');
    if (displayPhone) {
        const p = (user.phone || '').replace(/\D/g, '');
        if (p.length >= 10) {
            const clean = p.length === 11 ? p.substring(1) : p;
            displayPhone.innerText = `+7 (${clean.substring(0,3)}) ${clean.substring(3,6)}-${clean.substring(6,8)}-${clean.substring(8,10)}`;
        } else {
            displayPhone.innerText = '+7';
        }
    }
}

// 6. ЛОГИКА РЕДАКТИРОВАНИЯ
window.editField = (type) => {
    // Ищем элемент. Если это пароль, у него нет ID, ищем в последней группе безопасности
    let displayElem = document.getElementById(`display-${type}`);
    if (!displayElem && type === 'password') {
        displayElem = document.querySelector('.settings-group:last-of-type .field-row span');
    }
    
    if (!displayElem) return;

    const parentRow = displayElem.closest('.field-row') || displayElem.parentElement;
    const currentValue = (type === 'password') ? '' : displayElem.innerText;
    
    parentRow.style.display = 'none';

    const editHTML = `
        <div class="edit-mode-container" style="width: 100%; display: flex; gap: 5px; margin-top: 5px;">
            <input type="${type === 'password' ? 'password' : 'text'}" 
                   id="edit-input-${type}" 
                   value="${currentValue}" 
                   placeholder="${type === 'password' ? 'Новый пароль' : ''}"
                   style="flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 8px; outline: none;">
            <button onclick="saveEdit('${type}')" style="background:#fff; color:#000; border:none; padding:5px 10px; cursor:pointer;"><i class="fa-solid fa-check"></i></button>
            <button onclick="cancelEdit()" style="background:#222; color:#fff; border:1px solid #444; padding:5px 10px; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `;

    parentRow.insertAdjacentHTML('afterend', editHTML);
    const input = document.getElementById(`edit-input-${type}`);
    if (type === 'phone') applyPhoneMask(input);
    input.focus();
};

window.cancelEdit = () => {
    document.querySelectorAll('.edit-mode-container').forEach(el => el.remove());
    document.querySelectorAll('.field-row, .user-info-top').forEach(el => el.style.display = 'flex');
};

window.saveEdit = async (type) => {
    const input = document.getElementById(`edit-input-${type}`);
    let newValue = input.value.trim();
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (!newValue && type !== 'password') return showNotification("Заполните поле");

    let sendValue = newValue;
    if (type === 'phone') {
        sendValue = newValue.replace(/\D/g, '');
        if (sendValue.length < 11) return showNotification("Номер слишком короткий");
    }

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id || user.id, field: type, value: sendValue })
        });
        const data = await response.json();

        if (response.ok) {
            // МЕРДЖ: Важно! Сохраняем старые данные, добавляем новые из ответа
            const updatedUser = { ...user, ...data.user };
            
            // Если сервер не вернул обновленное поле в объекте user, форсируем его вручную (кроме пароля)
            if (type !== 'password') updatedUser[type] = sendValue;

            localStorage.setItem('userAccount', JSON.stringify(updatedUser));
            updateUI(updatedUser);
            showNotification("Обновлено");
            cancelEdit();
        } else {
            showNotification(data.message || "Ошибка");
        }
    } catch (e) {
        showNotification("Ошибка сервера");
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
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
};

window.togglePassword = (inputId, icon) => {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
};
