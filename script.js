document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // ОТКРЫТИЕ МЕНЮ
    if (menu) {
        menu.onclick = () => {
            menu.classList.toggle('open');
            navLinks.classList.toggle('active');
            
            if (navLinks.classList.contains('active')) {
                body.style.overflow = 'hidden'; // Запрет скролла
            } else {
                body.style.overflow = 'auto';
            }
        };
    }

    // ЗАКРЫТИЕ ПРИ КЛИКЕ НА ССЫЛКУ
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.onclick = () => {
            menu.classList.remove('open');
            navLinks.classList.remove('active');
            body.style.overflow = 'auto';
        };
    });

    // МОДАЛЬНОЕ ОКНО
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-modal');
    const btns = document.querySelectorAll('.btn-buy, .btn-order');

    btns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = "block";
            body.style.overflow = 'hidden';
        };
    });

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
            body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
            body.style.overflow = 'auto';
        }
    };
});
