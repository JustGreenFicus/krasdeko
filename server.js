const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;

// Настройка для работы с данными в формате JSON
app.use(express.json());
// Указываем, что все твои файлы (html, css, js) лежат в корне
app.use(express.static(path.join(__dirname, '/')));

const USERS_FILE = './users.json';

// Функция для чтения базы данных из файла
const getUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        const data = fs.readFileSync(USERS_FILE);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

// МАРШРУТ: РЕГИСТРАЦИЯ
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const users = getUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Этот логин уже занят' });
    }

    // Шифруем пароль (чтобы даже ты его не видел в файле)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashedPassword };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({ message: 'Регистрация прошла успешно!' });
});

// МАРШРУТ: ВХОД
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ message: 'Вход выполнен!', user: { username: user.username } });
    } else {
        res.status(400).json({ message: 'Неверный логин или пароль' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
