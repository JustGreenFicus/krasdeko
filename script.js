// Переменные
const menu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

// 1. Управление меню
menu.addEventListener('click', () => {
    menu.classList.toggle('open');
    navLinks.classList.toggle('active');

    // Блокируем скролл страницы, когда меню открыто
    if (navLinks.classList.contains('active')) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = 'auto';
    }
});

// Закрытие меню при переходе по ссылке
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('open');
        navLinks.classList.remove('active');
        body.style.overflow = 'auto';
    });
});

// 2. Модальное окно заказа
const modal = document.getElementById('orderModal');
const orderBtns = document.querySelectorAll('.btn-catalog, .btn-order, .btn-buy');
const closeBtn = document.querySelector('.close-modal');

orderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Если кнопка не ведет на другую страницу (например, catalog.html), открываем окно
        const href = btn.getAttribute('href');
        if (href === '#' || !href || href === '') {
            e.preventDefault();
            modal.style.display = "block";
            body.style.overflow = 'hidden';
        }
    });
});

if (closeBtn) {
    closeBtn.onclick = () => {
        modal.style.display = "none";
        if (!navLinks.classList.contains('active')) body.style.overflow = 'auto';
    };
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
        body.style.overflow = 'auto';
    }
};

// 3. Отправка формы (имитация)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = this.querySelector('input[type="tel"]').value;
        alert('Заявка принята! Мы позвоним на номер: ' + phone);
        modal.style.display = "none";
        body.style.overflow = 'auto';
        this.reset();
    });
}
