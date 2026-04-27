// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ
const API_URL = 'https://krasdeko.onrender.com'; 

// Вспомогательная функция для формирования правильного URL
const getPaths = (endpoint) => {
    const base = API_URL.replace(/\/$/, '');
    return [`${base}/api/${endpoint}`, `${base}/${endpoint}`];
};

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

// 4. ОСНОВНАЯ ЛОГИКА
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const overlay = document.getElementById('sidebar-overlay');
    const menuToggle = document.getElementById('mobile-menu');

    // Табы (анимация линии)
    setTimeout(() => {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) moveUnderline(activeTab);
    }, 100);

    // Обработка клика по бургер-меню
    if (menuToggle) {
        menuToggle.onclick = (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            toggleSidebar();
        };
    }

    document.querySelectorAll('input[name="phone"]').forEach(applyPhoneMask);
    if (overlay) overlay.onclick = () => toggleSidebar();

    const savedUser = JSON.parse(localStorage.getItem('userAccount'));
    if (savedUser) updateUI(savedUser);

    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.classList.add('active');
            const loginTab = document.querySelector('.tab[onclick*="login"]');
            if (loginTab) switchForm('login', loginTab);
        };
    }

    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => authModal.classList.remove('active');
    }

    // Слушатели форм
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm) loginForm.onsubmit = (e) => handleAuth(e, 'login');
    if (signupForm) signupForm.onsubmit = (e) => handleAuth(e, 'signup');

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

        const paths = getPaths(endpoint);
        let success = false;

        for (let url of paths) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.status === 404) continue;

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('userAccount', JSON.stringify(data.user));
                    showNotification(`Добро пожаловать!`);
                    authModal.classList.remove('active');
                    updateUI(data.user);
                    success = true;
                    break;
                } else {
                    showNotification(data.message || 'Ошибка данных', 'error');
                    success = true;
                    break;
                }
            } catch (error) { console.error("Network error:", error); }
        }

        if (!success) showNotification('Сервер недоступен', 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    }
});

// 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА (Профиль в сайдбаре)
function updateUI(user) {
    if (!user) return;
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        authSection.innerHTML = `<a href="#" onclick="toggleSidebar(); return false;" class="user-trigger"><i class="fa-regular fa-circle-user"></i> ${user.username.toUpperCase()}</a>`;
    }

    const sidebar = document.getElementById('user-sidebar');
    if (sidebar) {
        sidebar.innerHTML = `
            <h2>Мой профиль</h2>
            <div class="settings-group">
                <div class="field-row"><div class="field-info"><div class="field-label">Логин</div><div class="field-value" id="display-username">${user.username}</div></div><button class="edit-icon-btn" onclick="editField('username')"><i class="fa-solid fa-pen-nib"></i></button></div>
                <div class="field-row"><div class="field-info"><div class="field-label">Email</div><div class="field-value" id="display-email">${user.email}</div></div><button class="edit-icon-btn" onclick="editField('email')"><i class="fa-solid fa-pen-nib"></i></button></div>
                <div class="field-row"><div class="field-info"><div class="field-label">Телефон</div><div class="field-value" id="display-phone">${formatPhone(user.phone)}</div></div><button class="edit-icon-btn" onclick="editField('phone')"><i class="fa-solid fa-pen-nib"></i></button></div>
                <div class="field-row"><div class="field-info"><div class="field-label">Пароль</div><div class="field-value">••••••••</div></div><button class="edit-icon-btn" onclick="editField('password')"><i class="fa-solid fa-key"></i></button></div>
            </div>
            <button class="btn-logout" onclick="logout()">Выйти из системы</button>
        `;
    }
}

function formatPhone(p) {
    let clean = String(p || '').replace(/\D/g, '');
    if (clean.length < 10) return 'Не указан';
    if (clean.length === 11) clean = clean.substring(1);
    return `+7 (${clean.substring(0,3)}) ${clean.substring(3,6)}-${clean.substring(6,8)}-${clean.substring(8,10)}`;
}

// 6. УПРАВЛЕНИЕ РЕДАКТИРОВАНИЕМ
window.editField = (type) => {
    cancelEdit();
    if (type === 'password') return editPassword();
    
    const displayElem = document.getElementById(`display-${type}`);
    if (!displayElem) return;
    
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
        </div>`;
    parentRow.insertAdjacentHTML('afterend', editHTML);
    const input = document.getElementById(`edit-input-${type}`);
    if (type === 'phone') applyPhoneMask(input);
    input.focus();
};

window.editPassword = () => {
    const rows = document.querySelectorAll('.field-row');
    const passRow = Array.from(rows).find(r => r.innerText.includes('Пароль'));
    if (passRow) passRow.style.display = 'none';

    const editHTML = `
        <div class="edit-mode-container" id="edit-container-password">
            <input type="password" id="old-password" placeholder="Старый пароль" style="margin-bottom:8px">
            <input type="password" id="new-password" placeholder="Новый пароль" style="margin-bottom:8px">
            <input type="password" id="confirm-password" placeholder="Повтор пароля">
            <div class="edit-actions">
                <button onclick="savePassword()" class="btn-save-mini"><i class="fa-solid fa-check"></i></button>
                <button onclick="cancelEdit()" class="btn-cancel-mini"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>`;
    if (passRow) passRow.insertAdjacentHTML('afterend', editHTML);
};

window.cancelEdit = () => {
    document.querySelectorAll('.edit-mode-container').forEach(el => el.remove());
    document.querySelectorAll('.field-row').forEach(el => el.style.display = 'flex');
};

// 7. СОХРАНЕНИЕ ДАННЫХ (с проверкой путей)
window.saveEdit = async (type) => {
    const input = document.getElementById(`edit-input-${type}`);
    const user = JSON.parse(localStorage.getItem('userAccount'));
    let val = input.value.trim();
    if (type === 'phone') val = val.replace(/\D/g, '').replace(/^7/, '');

    const paths = getPaths('update-profile');
    let success = false;

    for (let url of paths) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id || user.id, field: type, value: val })
            });
            if (response.status === 404) continue;
            const data = await response.json();
            if (response.ok) {
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('userAccount', JSON.stringify(updatedUser));
                updateUI(updatedUser);
                cancelEdit();
                showNotification("Сохранено");
                success = true;
                break;
            } else {
                showNotification(data.message, 'error');
                success = true; break;
            }
        } catch (e) { console.error(e); }
    }
    if (!success) showNotification("Ошибка связи", "error");
};

window.savePassword = async () => {
    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('new-password').value;
    const confPass = document.getElementById('confirm-password').value;
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (newPass !== confPass) return showNotification("Пароли не совпадают", "error");

    const paths = getPaths('update-profile');
    let success = false;

    for (let url of paths) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user._id || user.id, 
                    field: 'password', 
                    oldPassword: oldPass, 
                    value: newPass 
                })
            });
            if (response.status === 404) continue;
            const data = await response.json();
            if (response.ok) {
                showNotification("Пароль изменен");
                cancelEdit();
                success = true;
                break;
            } else {
                showNotification(data.message || "Ошибка", "error");
                success = true; break;
            }
        } catch (e) { console.error(e); }
    }
    if (!success) showNotification("Ошибка сервера", "error");
};

// 8. ВСПОМОГАТЕЛЬНЫЕ
window.toggleSidebar = () => {
    const sidebar = document.getElementById('user-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    const isActive = sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    if (!isActive) cancelEdit();
};

window.logout = () => { localStorage.removeItem('userAccount'); window.location.reload(); };

window.switchForm = (type, element) => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    element.classList.add('active');
    const targetForm = document.getElementById(type + '-form');
    if (targetForm) targetForm.classList.add('active');
    moveUnderline(element);
};

function moveUnderline(element) {
    const underline = document.querySelector('.underline');
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
}
