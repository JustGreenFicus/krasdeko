const menu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');

// Меню и Бургер
menu.addEventListener('click', () => {
    menu.classList.toggle('open');
    navLinks.classList.toggle('active');
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('open');
        navLinks.classList.remove('active');
    });
});

// Модальное окно
const modal = document.getElementById('orderModal');
const btns = document.querySelectorAll('.btn-catalog, .btn-order, .btn-buy');
const closeBtn = document.querySelector('.close-modal');

btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Открываем окно только если это кнопка заказа (с href="#" или без него)
        if (btn.getAttribute('href') === '#' || !btn.hasAttribute('href')) {
            e.preventDefault();
            modal.style.display = "block";
        }
    });
});

if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// Форма
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
        modal.style.display = "none";
        this.reset();
    });
}
