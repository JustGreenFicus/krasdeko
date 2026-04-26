// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ
const API_URL = 'https://krasdeko.onrender.com'; 

// 2. ФУНКЦИЯ УВЕДОМЛЕНИЙ
function showNotification(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    
    if(type === 'error') toast.style.borderLeft = "4px solid #ff4444";
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { if(toast) toast.remove(); }, 500);
    }, 4000);
}

// 3. ЖЕСТКАЯ МАСКА ТЕЛЕФОНА
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
    const restrictCursor = () => {
        if (input.selectionStart < prefix.length) {
            input.setSelectionRange(prefix.length, prefix.length);
        }
    };
    input.addEventListener('input', (e) => {
        if (!e.target.value.startsWith(prefix)) e.target.value = prefix;
        let cursor = e.target.selectionStart;
        const oldLen = e.target.value.length;
        e.target.value = formatValue(e.target.value);
        const newLen = e.target.value.length;
        cursor = cursor + (newLen - oldLen);
        const finalPos = Math.max(prefix.length, cursor);
        e.target.setSelectionRange(finalPos, finalPos);
    });
    input.addEventListener('click', restrictCursor);
    input.addEventListener('focus', restrictCursor);
}

// 4. ОСНОВНАЯ ЛОГИКА ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const overlay = document.getElementById('sidebar-overlay');
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.onclick = () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('mobile-active');
        };
    }

    document.querySelectorAll('input[name="phone"]').forEach(applyPhoneMask);
    if (overlay) overlay.onclick = () => toggleSidebar();

    // Проверка авторизации
    const savedUser = JSON.parse(localStorage.getItem('userAccount'));
    if (savedUser) updateUI(savedUser);

    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.classList.add('active');
            setTimeout(() => {
                const tab = document.querySelector('.tab.active');
                if (tab) moveUnderline(tab);
            }, 10);
        };
    }

    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => authModal.classList.remove('active');
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
                localStorage.setItem('userAccount', JSON.stringify(data.user));
                showNotification(`Добро пожаловать!`);
                authModal.classList.remove('active');
                updateUI(data.user);
            } else {
                showNotification(data.message || 'Ошибка', 'error');
            }
        } catch (error) {
            showNotification('Ошибка сервера', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm) loginForm.onsubmit = (e) => handleAuth(e, 'login');
    if (signupForm) signupForm.onsubmit = (e) => handleAuth(e, 'signup');
});

// 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateUI(user) {
    if (!user) return;
    const authSection = document.getElementById('auth-section');
    const sidebarUsername = document.getElementById('display-username');
    const nameToShow = user.username || 'ПРОФИЛЬ';

    if (authSection) {
        authSection.innerHTML = `
            <a href="#" onclick="toggleSidebar(); return false;" class="user-trigger">
                <i class="fa-regular fa-circle-user"></i> ${nameToShow.toUpperCase()}
            </a>
        `;
    }
    
    if (sidebarUsername) sidebarUsername.innerText = nameToShow;
    const emailElem = document.getElementById('display-email');
    if (emailElem) emailElem.innerText = user.email || 'Не указана';
    
    const phoneElem = document.getElementById('display-phone');
    if (phoneElem) {
        let p = String(user.phone || '');
        let clean = p.replace(/\D/g, '');
        if (clean.length >= 10) {
            if (clean.length === 11) clean = clean.substring(1);
            phoneElem.innerText = `+7 (${clean.substring(0,3)}) ${clean.substring(3,6)}-${clean.substring(6,8)}-${clean.substring(8,10)}`;
        } else {
            phoneElem.innerText = 'Не указан';
        }
    }
}

// 6. УПРАВЛЕНИЕ САЙДБАРОМ
window.toggleSidebar = () => {
    const sidebar = document.getElementById('user-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    if (!sidebar.classList.contains('active')) cancelEdit();
};

// 7. РЕДАКТИРОВАНИЕ
window.editField = (type) => {
    cancelEdit();
    if (type === 'password') return editPassword();

    const displayElem = document.getElementById(`display-${type}`);
    const parentRow = displayElem.closest('.field-row');
    const currentValue = displayElem.innerText;
    parentRow.style.display = 'none';

    const editHTML = `
        <div class="edit-mode-container field-row-editing" id="edit-container-${type}">
            <input type="${type === 'email' ? 'email' : 'text'}" id="edit-input-${type}" value="${currentValue}">
            <div class="edit-actions">
                <button onclick="saveEdit('${type}')" class="btn-save-mini"><i class="fa-solid fa-check"></i></button>
                <button onclick="cancelEdit()" class="btn-cancel-mini"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    `;
    parentRow.insertAdjacentHTML('afterend', editHTML);
    const input = document.getElementById(`edit-input-${type}`);
    if (type === 'phone') applyPhoneMask(input);
    input.focus();
};

window.editPassword = () => {
    const displayRow = document.querySelector('.settings-group .field-row:has(#display-password)');
    if (displayRow) displayRow.style.display = 'none';

    const editHTML = `
        <div class="edit-mode-container password-edit-block" id="edit-container-password">
            <div class="input-with-eye">
                <input type="password" id="old-password" placeholder="Старый пароль">
                <i class="fa-regular fa-eye eye-icon" onclick="togglePassword('old-password', this)"></i>
            </div>
            <div class="input-with-eye">
                <input type="password" id="new-password" placeholder="Новый пароль" oninput="liveComparePass()">
                <i class="fa-regular fa-eye eye-icon" onclick="togglePassword('new-password', this)"></i>
            </div>
            <div class="input-with-eye">
                <input type="password" id="confirm-password" placeholder="Повторите новый" oninput="liveComparePass()">
                <i class="fa-regular fa-eye eye-icon" onclick="togglePassword('confirm-password', this)"></i>
            </div>
            <div class="edit-actions">
                <button onclick="savePassword()" class="btn-save-mini"><i class="fa-solid fa-check"></i></button>
                <button onclick="cancelEdit()" class="btn-cancel-mini"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    `;
    displayRow.insertAdjacentHTML('afterend', editHTML);
};

// Мгновенная подсветка несовпадающих паролей
window.liveComparePass = () => {
    const n = document.getElementById('new-password');
    const c = document.getElementById('confirm-password');
    const color = (n.value !== c.value && c.value !== "") ? "#ff4444" : "#333";
    n.parentElement.style.borderBottom = `1px solid ${color}`;
    c.parentElement.style.borderBottom = `1px solid ${color}`;
};

window.cancelEdit = () => {
    document.querySelectorAll('.edit-mode-container').forEach(el => el.remove());
    document.querySelectorAll('.field-row').forEach(el => el.style.display = 'flex');
};

// 8. СОХРАНЕНИЕ
window.saveEdit = async (type) => {
    const input = document.getElementById(`edit-input-${type}`);
    const user = JSON.parse(localStorage.getItem('userAccount'));
    let val = input.value.trim();

    if (type === 'phone') val = val.replace(/\D/g, '').replace(/^7/, '');

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id || user.id, field: type, value: val })
        });
        const data = await response.json();
        if (response.ok) {
            const updatedUser = { ...user, ...data.user };
            localStorage.setItem('userAccount', JSON.stringify(updatedUser));
            updateUI(updatedUser);
            cancelEdit();
            showNotification("Данные обновлены");
        } else {
            showNotification(data.message, 'error');
        }
    } catch (e) {
        showNotification("Ошибка сети", 'error');
    }
};

window.savePassword = async () => {
    const oldPassInput = document.getElementById('old-password');
    const newPassInput = document.getElementById('new-password');
    const confirmPassInput = document.getElementById('confirm-password');
    const user = JSON.parse(localStorage.getItem('userAccount'));

    // Сброс индикации
    oldPassInput.parentElement.style.borderBottom = "1px solid #333";

    if (newPassInput.value !== confirmPassInput.value) {
        showNotification("Новые пароли не совпадают", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: user._id || user.id, 
                field: 'password', 
                oldPassword: oldPassInput.value, 
                value: newPassInput.value 
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            showNotification("Пароль изменен!");
            cancelEdit();
        } else {
            // Если сервер отклонил старый пароль
            showNotification(data.message || "Неверный старый пароль", "error");
            oldPassInput.parentElement.style.borderBottom = "1px solid #ff4444";
        }
    } catch (e) {
        showNotification("Ошибка связи", "error");
    }
};

// 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
window.logout = () => {
    localStorage.removeItem('userAccount');
    window.location.reload();
};

window.switchForm = (type, element) => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');
    moveUnderline(element);
};

function moveUnderline(element) {
    const underline = document.querySelector('.underline');
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
}

window.togglePassword = (inputId, icon) => {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
};
