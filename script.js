document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuthBtn = document.getElementById('closeAuthBtn');

    // Мобильное меню
    if (menu) {
        menu.onclick = () => {
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        };
    }

    // Открытие авторизации
    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
    }

    // Закрытие авторизации
    if (closeAuthBtn) {
        closeAuthBtn.onclick = () => {
            authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    }

    // Закрытие по фону
    window.onclick = (event) => {
        if (event.target == authModal) {
            authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };
});

// Переключение вкладок (Вне DOMContentLoaded)
function switchForm(type, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    element.classList.add('active');
    document.getElementById(type + '-form').classList.add('active');

    const underline = document.querySelector('.underline');
    underline.style.left = element.offsetLeft + 'px';
    underline.style.width = element.offsetWidth + 'px';
}
