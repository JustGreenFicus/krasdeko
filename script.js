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

// 3. ЖЕСТКАЯ МАСКА ТЕЛЕФОНА (БЛОКИРОВКА ПРЕФИКСА)
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

    // Запрет перемещения курсора в область префикса
    const restrictCursor = (e) => {
        if (input.selectionStart < prefix.length) {
            input.setSelectionRange(prefix.length, prefix.length);
        }
    };

    input.addEventListener('input', (e) => {
        if (!e.target.value.startsWith(prefix)) {
            e.target.value = prefix;
        }
        
        let cursor = e.target.selectionStart;
        const oldLen = e.target.value.length;
        e.target.value = formatValue(e.target.value);
        const newLen = e.target.value.length;
        
        cursor = cursor + (newLen - oldLen);
        const finalPos = Math.max(prefix.length, cursor);
        e.target.setSelectionRange(finalPos, finalPos);
    });

    input.addEventListener('keydown', (e) => {
        // Блокируем стирание префикса
        if (e.key === 'Backspace' && input.selectionStart <= prefix.length) {
            e.preventDefault();
        }
        // Блокируем попытку уйти влево стрелками
        if (e.key === 'ArrowLeft' && input.selectionStart <= prefix.length) {
            e.preventDefault();
        }
    });

    input.addEventListener('click', restrictCursor);
    input.addEventListener('focus', restrictCursor);
    input.addEventListener('keyup', restrictCursor);
}

// 4. ОСНОВНАЯ ЛОГИКА ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const overlay = document.getElementById('sidebar-overlay');

    document.querySelectorAll('input[name="phone"]').forEach(applyPhoneMask);

    if (overlay) {
        overlay.onclick = () => toggleSidebar();
    }

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

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

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
    const sidebarUsername = document.getElementById('display-username');
    const formattedName = user.username ? user.username.toUpperCase() : 'ПРОФИЛЬ';

    if (authSection) {
        authSection.innerHTML = `
            <a href="#" onclick="toggleSidebar(); return false;" class="user-trigger">
                <i class="fa-regular fa-circle-user"></i> ${formattedName}
            </a>
        `;
    }

    if (sidebarUsername) {
        sidebarUsername.innerText = user.username;
    }

    if (document.getElementById('display-email')) {
        document.getElementById('display-email').innerText = user.email || 'Не указана';
        
        const p = user.phone || '';
        const d = p.replace(/\D/g, '');
        if (d.length >= 10) {
            const clean = d.length === 11 ? d.substring(1) : d;
            document.getElementById('display-phone').innerText = `+7 (${clean.substring(0,3)}) ${clean.substring(3,6)}-${clean.substring(6,8)}-${clean.substring(8,10)}`;
        } else {
            document.getElementById('display-phone').innerText = '+7';
        }
    }
}

// 6. УПРАВЛЕНИЕ САЙДБАРОМ
window.toggleSidebar = () => {
    const sidebar = document.getElementById('user-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
        cancelEdit();
    }
};

// 7. ЛОГИКА РЕДАКТИРОВАНИЯ
window.editField = (type) => {
    cancelEdit();
    const displayElem = document.getElementById(`display-${type}`);
    if (!displayElem) return;

    const parentRow = displayElem.parentElement;
    let currentValue = displayElem.innerText;
    
    // Если правим телефон, убираем форматирование для инпута
    if (type === 'phone' && currentValue === '+7') currentValue = '+7 ';
    
    parentRow.style.display = 'none';

    const editHTML = `
        <div class="edit-mode-container">
            <input type="${type === 'password' ? 'password' : (type === 'email' ? 'email' : 'text')}" 
                   id="edit-input-${type}" 
                   value="${type === 'password' ? '' : currentValue}" 
                   placeholder="${type === 'password' ? 'Новый пароль' : ''}">
            <button onclick="saveEdit('${type}')" class="btn-save-mini"><i class="fa-solid fa-check"></i></button>
            <button onclick="cancelEdit()" class="btn-cancel-mini"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `;

    parentRow.insertAdjacentHTML('afterend', editHTML);
    const input = document.getElementById(`edit-input-${type}`);
    if (type === 'phone') applyPhoneMask(input);
    input.focus();
};

window.cancelEdit = () => {
    document.querySelectorAll('.edit-mode-container').forEach(el => el.remove());
    document.querySelectorAll('.field-row').forEach(el => el.style.display = 'flex');
};

window.saveEdit = async (type) => {
    const input = document.getElementById(`edit-input-${type}`);
    let val = input.value.trim();
    const user = JSON.parse(localStorage.getItem('userAccount'));

    let sendVal = val;
    if (type === 'phone') {
        sendVal = val.replace(/\D/g, '');
        // Если номер начинается на 7 или 8, обрезаем
        if (sendVal.length === 11) sendVal = sendVal.substring(1);
        if (sendVal.length < 10) return showNotification("Номер слишком короткий");
    }

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id || user.id, field: type, value: sendVal })
        });
        const data = await response.json();
        if (response.ok) {
            const updatedUser = { ...user, ...data.user };
            localStorage.setItem('userAccount', JSON.stringify(updatedUser));
            updateUI(updatedUser);
            showNotification("Данные обновлены");
            cancelEdit();
        } else {
            showNotification(data.message || "Ошибка");
        }
    } catch (e) {
        showNotification("Ошибка связи");
    }
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
