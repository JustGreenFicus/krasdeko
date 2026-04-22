const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

// Настройки
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Подключение к базе данных
const mongoURI = 'mongodb+srv://JustGreenFicus:OvEr88888888@krasdecobase.axx0rgf.mongodb.net/krasdeco?retryWrites=true&w=majority&appName=KrasDecoBase';

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Успешное подключение к MongoDB Atlas'))
    .catch(err => console.error('❌ Ошибка подключения к базе:', err));

// Модель пользователя
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// --- API МАРШРУТЫ ---

// Регистрация
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Этот логин уже занят' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ message: 'Аккаунт успешно создан в облаке!' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
});

// Вход
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ message: 'Вход выполнен успешно!', user: { username: user.username } });
        } else {
            res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при входе' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

// --- АНТИ-СОН (SELF-PING) ---
// Этот блок кода стучится по ссылке каждые 14 минут, чтобы Render не засыпал
setInterval(() => {
    https.get('https://krasdeko.onrender.com', (res) => {
        console.log('Анти-сон: запрос прошел. Статус:', res.statusCode);
    }).on('error', (err) => {
        console.error('Ошибка анти-сна:', err.message);
    });
}, 840000);
