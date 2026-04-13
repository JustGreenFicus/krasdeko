// 1. Управление мобильным меню (Бургер)
const menu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');

menu.addEventListener('click', () => {
    // Переключаем анимацию крестика (класс open)
    menu.classList.toggle('open');
    // Показываем/скрываем само меню (класс active)
    navLinks.classList.toggle('active');
});

// Закрываем меню при клике на любую ссылку (чтобы не мешало после перехода)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('open');
        navLinks.classList.remove('active');
    });
});

// 2. Управление модальным окном заказа
const modal = document.getElementById('orderModal');
const btns = document.querySelectorAll('.btn-catalog, .btn-order, .btn-buy');
const closeBtn = document.querySelector('.close-modal');

// Открытие окна при нажатии на кнопки
btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Если кнопка — ссылка на другую страницу (catalog.html), 
        // окно откроется только если href="#" или если это кнопка внутри карточки.
        if (btn.getAttribute('href') === '#' || !btn.hasAttribute('href')) {
            e.preventDefault();
            modal.style.display = "block";
        }
    });
});

// Закрытие окна при клике на крестик
if (closeBtn) {
    closeBtn.onclick = () => {
        modal.style.display = "none";
    }
}

// Закрытие окна при клике вне его области
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// 3. Обработка формы заказа
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = this.querySelector('input[type="tel"]').value;
        alert('Спасибо за заказ! Мы свяжемся с вами по номеру: ' + phone);
        modal.style.display = "none";
        this.reset(); // Очистить поля формы
    });
}
