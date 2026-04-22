document.addEventListener('DOMContentLoaded', () => {
    // 1. МОБИЛЬНОЕ МЕНЮ
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menu && navLinks) {
        menu.onclick = (e) => {
            e.stopPropagation(); // Чтобы клик не улетал дальше
            menu.classList.toggle('open');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        };

        // Закрытие меню при клике на ссылки внутри
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.onclick = () => {
                menu.classList.remove('open');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            };
        });
    }

    // 2. ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ МОДАЛОК
    function openModal(modalId, displayType = 'block') {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = displayType;
            document.body.style.overflow = 'hidden';
            // Если открываем модалку, закрываем мобильное меню (на всякий случай)
            if (menu) {
                menu.classList.remove('open');
                navLinks.classList.remove('active');
            }
        }
    }

    // Кнопки заказа
    const orderBtns = document.querySelectorAll('.btn-order, .btn-buy');
    orderBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            openModal('orderModal', 'block');
        };
    });

    // Кнопка авторизации
    const openAuthBtn = document.getElementById('openAuthBtn');
    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            openModal('authModal', 'flex');
        };
    }

    // 3. УНИВЕРСАЛЬНОЕ ЗАКРЫТИЕ (Фон и Крестики)
    window.addEventListener('click', (event) => {
        const orderModal = document.getElementById('orderModal');
        const authModal = document.getElementById('authModal');

        // Закрытие по клику на серый фон
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (event.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Закрытие по любому крестику
        if (event.target.classList.contains('close-modal') || event.target.closest('.close-modal')) {
            if (orderModal) orderModal.style.display = 'none';
            if (authModal) authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// 4. ПЕРЕКЛЮЧЕНИЕ ТАБОВ (SIGN IN / SIGN UP)
function switchForm(type, element) {
    const underline = document.querySelector('.underline');
    const targetForm = document.getElementById(type + '-form');

    if (!targetForm || !element) return;

    // Убираем активные состояния
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    // Включаем нужные
    element.classList.add('active');
    targetForm.classList.add('active');

    // Двигаем полоску
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
}
