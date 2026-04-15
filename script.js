document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Мобильное меню
    menu.onclick = () => {
        menu.classList.toggle('open');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    };

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.onclick = () => {
            menu.classList.remove('open');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    });

    // Модальное окно заказа
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-modal');
    // Находим все кнопки открытия окна
    const orderBtns = document.querySelectorAll('.btn-order, .btn-buy, .btn-catalog-main');

    orderBtns.forEach(btn => {
        btn.onclick = (e) => {
            // Если это не переход в каталог, а кнопка действия — открыть модалку
            if (btn.innerText.includes('ЗАКАЗАТЬ') || btn.innerText.includes('ОТПРАВИТЬ')) {
                e.preventDefault();
                modal.style.display = "block";
                document.body.style.overflow = 'hidden';
            }
        };
    });

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    };
});

// Открытие / Закрытие модалки
const modal = document.getElementById('authModal');
const openBtn = document.getElementById('openAuthBtn');
const closeBtn = document.getElementById('closeAuthBtn');

openBtn.onclick = (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
}

closeBtn.onclick = () => modal.style.display = 'none';

window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
}

// Переключение SIGN IN / SIGN UP
function switchForm(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');

    // Движение линии
    const underline = document.querySelector('.underline');
    underline.style.width = element.offsetWidth + 'px';
    underline.style.left = element.offsetLeft + 'px';
        }
