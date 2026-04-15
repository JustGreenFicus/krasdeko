document.addEventListener('DOMContentLoaded', () => {
    // 1. МОБИЛЬНОЕ МЕНЮ
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menu && navLinks) {
        menu.onclick = () => {
            menu.classList.toggle('open');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        };

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.onclick = () => {
                menu.classList.remove('open');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            };
        });
    }

    // 2. МОДАЛКИ (Универсальная функция открытия)
    function setupModal(btnSelector, modalId) {
        const btns = document.querySelectorAll(btnSelector);
        const modal = document.getElementById(modalId);
        
        if (!modal) return; // Если модалки нет на этой странице, выходим

        btns.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                // Для авторизации используем flex, для заказа block (как в твоем CSS)
                modal.style.display = (modalId === 'authModal') ? 'flex' : 'block';
                document.body.style.overflow = 'hidden';
            };
        });
    }

    setupModal('.btn-order, .btn-buy', 'orderModal');
    setupModal('#openAuthBtn', 'authModal');

    // 3. УНИВЕРСАЛЬНОЕ ЗАКРЫТИЕ (Исправлено)
    window.addEventListener('click', (event) => {
        const orderModal = document.getElementById('orderModal');
        const authModal = document.getElementById('authModal');

        // Закрытие при клике на фон (проверяем существование модалки)
        if (orderModal && event.target == orderModal) {
            orderModal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
        if (authModal && event.target == authModal) {
            authModal.style.display = "none";
            document.body.style.overflow = 'auto';
        }

        // Закрытие при клике на крестик
        if (event.target.classList.contains('close-modal') || event.target.id === 'closeAuthBtn') {
            if (orderModal) orderModal.style.display = "none";
            if (authModal) authModal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    });
});

// 4. ПЕРЕКЛЮЧЕНИЕ ФОРМ
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
