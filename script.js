
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ---
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const loginForm = document.getElementById('login-form');

    // --- 2. ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАГРУЗКЕ ---
    const savedUser = localStorage.getItem('userAccount');
    if (savedUser) {
        updateNavWithUser(savedUser);
    }

    // --- 3. ФУНКЦИЯ УВЕДОМЛЕНИЯ В УГЛУ (СНЭКБАР) ---
    function showNotification(message) {
        // Создаем контейнер, если его нет
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerHTML = <span>${message}</span>;
        container.appendChild(toast);
        
        // Анимация появления
        setTimeout(() => toast.classList.add('show'), 100);

        // Удаление через 4 секунды
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // --- 4. ОБНОВЛЕНИЕ МЕНЮ ПРИ ВХОДЕ ---
    function updateNavWithUser(username) {
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.innerHTML = 
                <div class="user-profile-nav">
                    <span class="user-name-display"><i class="fa-regular fa-user"></i> ${username.toUpperCase()}</span>
                    <button class="logout-link" onclick="logoutUser()">ВЫХОД</button>
                </div>
            ;
        }
    }

    // Глобальная функция выхода
    window.logoutUser = () => {
        localStorage.removeItem('userAccount');
        location.reload();
    };

    // --- 5. ЛОГИКА ОТКРЫТИЯ ОКНА "ВОЙТИ" ---
    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Открываем только если не залогинены
            if (!localStorage.getItem('userAccount')) {
                authModal.classList.add('active');
                authModal.style.display = 'flex'; // Дублируем для надежности
                document.body.style.overflow = 'hidden'; 
                
                // Закрываем мобильное меню при открытии модалки
                if (menu) {
                    menu.classList.remove('open');
                    navLinks.classList.remove('active');
                }
            }
        };
    }

    // --- 6. МОБИЛЬНОЕ МЕНЮ (БУРГЕР) ---
    if (menu && navLinks) {
        menu.onclick = (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        };
    }

    // --- 7. ЗАКРЫТИЕ МОДАЛОК (КРЕСТИК И ФОН) ---
    window.addEventListener('click', (event) => {
        if (event.target === authModal  event.target.classList.contains('close-modal')  event.target.closest('.close-modal')) {
            if (authModal) {
                authModal.classList.remove('active');
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });

    // --- 8. ОБРАБОТКА ФОРМЫ ВХОДА (ОБЩЕНИЕ С БАЗОЙ) ---
    if (loginForm) {

loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('input[type="text"]').value;
            
            // Здесь логика твоего fetch запроса к Render/MongoDB
            // Для теста просто сохраняем и показываем уведомление:
            localStorage.setItem('userAccount', username);
            
            showNotification(С возвращением, ${username}!);
            
            // Небольшая задержка перед обновлением, чтобы увидеть уведомление
            setTimeout(() => {
                location.reload();
            }, 1000);
        };
    }
});

// --- 9. ПЕРЕКЛЮЧЕНИЕ ТАБОВ (SIGN IN / SIGN UP) ---
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
