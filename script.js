
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ПРОВЕРКА АВТОРИЗАЦИИ (НОВОЕ) ---
    const savedUser = localStorage.getItem('userAccount');
    if (savedUser) {
        updateNavWithUser(savedUser);
    }

    function updateNavWithUser(username) {
        const authSection = document.getElementById('auth-section') || document.querySelector('#openAuthBtn')?.parentElement;
        if (authSection) {
            authSection.innerHTML = 
                <div class="user-profile-nav">
                    <span class="user-name-display"><i class="fa-regular fa-user"></i> ${username.toUpperCase()}</span>
                    <button class="logout-link" onclick="logoutUser()">ВЫХОД</button>
                </div>
            ;
        }
    }

    window.logoutUser = () => {
        localStorage.removeItem('userAccount');
        location.reload();
    };

    // --- 2. МОБИЛЬНОЕ МЕНЮ ---
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menu && navLinks) {
        menu.onclick = (e) => {
            e.stopPropagation();
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

    // --- 3. ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ МОДАЛОК ---
    function openModal(modalId, displayType = 'block') {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = displayType;
            document.body.style.overflow = 'hidden';
            if (menu) {
                menu.classList.remove('open');
                navLinks.classList.remove('active');
            }
        }
    }

    const orderBtns = document.querySelectorAll('.btn-order, .btn-buy');
    orderBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            openModal('orderModal', 'block');
        };
    });

    const openAuthBtn = document.getElementById('openAuthBtn');
    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            openModal('authModal', 'flex');
        };
    }

    // --- 4. ЗАКРЫТИЕ МОДАЛОК ---
    window.addEventListener('click', (event) => {
        const orderModal = document.getElementById('orderModal');
        const authModal = document.getElementById('authModal');

        if (event.target === orderModal || event.target === authModal) {
            if (orderModal) orderModal.style.display = 'none';
            if (authModal) authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        if (event.target.classList.contains('close-modal') || event.target.closest('.close-modal')) {
            if (orderModal) orderModal.style.display = 'none';
            if (authModal) authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // --- 5. ОБРАБОТКА ВХОДА (НОВОЕ) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('input[type="text"]').value;
            localStorage.setItem('userAccount', username);
            location.reload(); 
        };
    }
});

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
