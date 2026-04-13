// 1. Мобильное меню
const menu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');

menu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// 2. Открытие модального окна
const modal = document.getElementById('orderModal');
const btns = document.querySelectorAll('.btn-catalog, .btn-order, .btn-buy'); // Все ваши кнопки заказа
const closeBtn = document.querySelector('.close-modal');

btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault(); // Чтобы страница не перезагружалась
        modal.style.display = "block";
    });
});

// Закрытие окна при клике на крестик или вне окна
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
}

// 3. Простая имитация отправки формы
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Спасибо за заказ! Мы свяжемся с вами по номеру ' + this.querySelector('input[type="tel"]').value);
    modal.style.display = "none";
});
const menu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('.nav-links');

menu.addEventListener('click', () => {
    // Включаем/выключаем анимацию крестика
    menu.classList.toggle('open');
    // Показываем/скрываем само меню
    navLinks.classList.toggle('active');
});

// Закрываем меню при клике на любую ссылку внутри
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('open');
        navLinks.classList.remove('active');
    });
});
