document.addEventListener('DOMContentLoaded', () => {
    // 1. МОБИЛЬНОЕ МЕНЮ
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menu) {
        menu.onclick = () => {
            menu.classList.toggle('open');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        };
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.onclick = () => {
            menu.classList.remove('open');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    });

    // 2. МОДАЛКА ЗАКАЗА (Order Modal)
    const orderModal = document.getElementById('orderModal');
    const orderBtns = document.querySelectorAll('.btn-order, .btn-buy'); // Убрал btn-catalog-main, чтобы он работал как ссылка

    orderBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            orderModal.style.display = "block";
            document.body.style.overflow = 'hidden';
        };
    });

    // 3. МОДАЛКА АВТОРИЗАЦИИ (Auth Modal)
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');

    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    // Универсальное закрытие окон при клике на крестик или фон
    window.onclick = (event) => {
        // Закрытие по фону
        if (event.target == orderModal) {
            orderModal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
        if (event.target == authModal) {
            authModal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
        // Закрытие модалки заказа по её крестику
        if (event.target.classList.contains('close-modal')) {
             orderModal.style.display = "none";
             authModal.style.display = "none";
             document.body.style.overflow = 'auto';
        }
    };
});

// 4. ПЕРЕКЛЮЧЕНИЕ ФОРМ (Вынесено из DOMContentLoaded, так как вызывается из HTML)
function switchForm(type, element) {
    // Убираем активные классы
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    // Активируем нужную вкладку и форму
    element.classList.add('active');
    const targetForm = document.getElementById(type + '-form');
    if (targetForm) targetForm.classList.add('active');

    // Движение линии
    const underline = document.querySelector('.underline');
    if (underline) {
        underline.style.width = element.offsetWidth + 'px';
        underline.style.left = element.offsetLeft + 'px';
    }
}
