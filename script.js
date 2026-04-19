document.addEventListener('DOMContentLoaded', () => {
    // 1. ПЕРЕМЕННЫЕ ЭЛЕМЕНТОВ
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');

    // 2. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
    if (menu && navLinks) {
        menu.onclick = (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        };

        // Закрытие меню при клике на любую ссылку
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.onclick = () => {
                menu.classList.remove('open');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            };
        });
    }

    // 3. УПРАВЛЕНИЕ МОДАЛКОЙ АВТОРИЗАЦИИ
    if (openAuthBtn && authModal) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.style.display = 'flex'; // Используем flex для центрирования
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    // Закрытие модалки при клике на темный фон
    window.addEventListener('click', (event) => {
        if (event.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // 4. ОТПРАВКА ФОРМЫ РЕГИСТРАЦИИ (SIGN UP)
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
                alert(result.message);
                
                if (response.ok) {
                    // После успешной регистрации переключаем на форму входа
                    location.reload(); 
                }
            } catch (error) {
                alert('Ошибка соединения с сервером');
            }
        };
    }

    // 5. ОТПРАВКА ФОРМЫ ВХОДА (SIGN IN)
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
                    alert('Добро пожаловать, ' + result.user.username + '!');
                    authModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    // Здесь можно изменить кнопку "Войти" на имя пользователя
                    if (openAuthBtn) openAuthBtn.innerHTML = `<i class="fa-regular fa-user"></i> ${result.user.username}`;
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Ошибка соединения с сервером');
            }
        };
    }
});

// 6. ПЕРЕКЛЮЧЕНИЕ ТАБОВ (SIGN IN / SIGN UP) - Вне DOMContentLoaded
function switchForm(type, element) {
    const underline = document.querySelector('.underline');
    const targetForm = document.getElementById(type + '-form');

    if (!targetForm || !element) return;

    // Убираем активные классы у всех табов и форм
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    // Добавляем активный класс нажатому табу и нужной форме
    element.classList.add('active');
    targetForm.classList.add('active');

    // Двигаем подчеркивание
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
}
