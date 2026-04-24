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

// 3. УЛУЧШЕННАЯ МАСКА ТЕЛЕФОНА (БЕТОННАЯ ФИКСАЦИЯ)
function applyPhoneMask(input) {
    const prefix = '+7 ';

    const formatValue = (val) => {
        let d = val.replace(/\D/g, '');
        if (d.startsWith('7') || d.startsWith('8')) d = d.substring(1);
        d = d.substring(0, 10);

        let res = prefix;
        if (d.length > 0) res += d.substring(0, 3);
        if (d.length >= 4) res += '-' + d.substring(3, 6);
        if (d.length >= 7) res += '-' + d.substring(6, 8);
        if (d.length >= 9) res += '-' + d.substring(8, 10);
        
        return res;
    };

    // Функция для удержания курсора в нужной позиции
    const fixCursor = () => {
        if (input.selectionStart < 3) {
            input.setSelectionRange(input.value.length, input.value.length);
        }
    };

    input.addEventListener('input', (e) => {
        let val = e.target.value;
        if (!val.startsWith(prefix)) {
            e.target.value = prefix;
            return;
        }

        let cursor = e.target.selectionStart;
        const oldLen = val.length;
        e.target.value = formatValue(val);
        const newLen = e.target.value.length;

        cursor = cursor + (newLen - oldLen);
        if (cursor <= 3) cursor = 3;
        e.target.setSelectionRange(cursor, cursor);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.selectionStart <= 3) {
            e.preventDefault();
        }
    });

    // Фикс для кликов и фокуса на мобилках (планшетах)
    input.addEventListener('click', fixCursor);
    input.addEventListener('focus', fixCursor);
    input.addEventListener('mouseup', (e) => setTimeout(fixCursor, 10));
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
            if (key === 'phone') {
                formData[key] = value.replace(/\D/g, '');
            } else if (endpoint === 'login' && key === 'username') {
                formData['identifier'] = value;
            } else {
                formData[key] = value;
            }
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

// 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА (ФИКС ИСЧЕЗНОВЕНИЯ НИКА)
function updateUI(user) {
    const authSection = document.getElementById('auth-section');
    const sidebarTitle = document.querySelector('#user-sidebar .user-trigger');

    const formattedName = user.username ? user.username.toUpperCase() : 'ПРОФИЛЬ';

    // Обновляем кнопку входа
    if (authSection) {
        authSection.innerHTML = `
            <a href="#" onclick="toggleSidebar()" class="user-trigger">
                <i class="fa-regular fa-circle-user"></i> ${formattedName}
            </a>
        `;
    }

    // Обновляем ник внутри сайдбара (чтобы не пропадал)
    if (sidebarTitle) {
        sidebarTitle.innerHTML = `<i class="fa-regular fa-circle-user"></i> ${formattedName}`;
    }
    
    if (document.getElementById('display-username')) {
        document.getElementById('display-username').innerText = user.username;
        document.getElementById('display-email').innerText = user.email || 'Не указана';
        
        const p = user.phone || '';
        if (p.replace(/\D/g, '').length >= 10) {
            const d = p.replace(/\D/g, '');
            const clean = d.startsWith('7') ? d.substring(1) : d;
            document.getElementById('display-phone').innerText = `+7 ${clean.substring(0,3)}-${clean.substring(3,6)}-${clean.substring(6,8)}-${clean.substring(8,10)}`;
        } else {
            document.getElementById('display-phone').innerText = '+7';
        }
    }
}

// 6. ЛОГИКА РЕДАКТИРОВАНИЯ
window.editField = (type) => {
    const displayElem = document.getElementById(`display-${type}`);
    if (!displayElem) return;

    const currentValue = displayElem.innerText;
    displayElem.style.display = 'none';
    const nextBtn = displayElem.nextElementSibling;
    if (nextBtn) nextBtn.style.display = 'none'; 

    const editHTML = `
        <div class="edit-mode-container" style="width: 100%; display: flex; gap: 5px; margin-top: 5px;">
            <input type="${type === 'email' ? 'email' : 'text'}" id="edit-input-${type}" value="${currentValue}" 
                   style="flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 5px; outline: none;">
            <button onclick="saveEdit('${type}')" class="btn-save-mini"><i class="fa-solid fa-check"></i></button>
            <button onclick="cancelEdit()" class="btn-cancel-mini"><i class="fa-solid fa-xmark"></i></button>
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
    let newValue = input.value;
    const user = JSON.parse(localStorage.getItem('userAccount'));

    if (!newValue || newValue === '+7 ') {
        showNotification("Заполните поле");
        return;
    }

    if (type === 'phone') {
        newValue = newValue.replace(/\D/g, ''); 
        if (newValue.length < 11) {
            showNotification("Номер слишком короткий");
            return;
        }
    }

    try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: user._id || user.id, 
                field: type, 
                value: newValue 
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Создаем новый объект, чтобы ничего не потерять
            const updatedUser = { ...user, [type]: newValue };
            localStorage.setItem('userAccount', JSON.stringify(updatedUser));
            updateUI(updatedUser);
            showNotification("Обновлено");
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
