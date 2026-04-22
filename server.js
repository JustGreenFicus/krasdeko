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

// Подключение к MongoDB
const mongoURI = 'mongodb+srv://JustGreenFicus:OvEr88888888@krasdecobase.axx0rgf.mongodb.net/krasdeco?retryWrites=true&w=majority&appName=KrasDecoBase';

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB error:', err));

// Схема пользователя
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// --- API: РЕГИСТРАЦИЯ ---
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Этот логин уже занят' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ message: 'Аккаунт создан!' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// --- API: ВХОД ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ message: 'Успешно!', user: { username: user.username } });
        } else {
            res.status(400).json({ message: 'Неверные данные' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// --- API: ИЗМЕНЕНИЕ НИКНЕЙМА ---
app.post('/api/update-username', async (req, res) => {
    try {
        const { oldUsername, newUsername } = req.body;
        
        // Проверяем занятость нового имени
        const taken = await User.findOne({ username: newUsername });
        if (taken) return res.status(400).json({ message: 'Этот никнейм уже занят' });

        const user = await User.findOneAndUpdate(
            { username: oldUsername },
            { username: newUsername },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json({ message: 'Никнейм изменен!', username: user.username });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при смене имени' });
    }
});

// --- API: ИЗМЕНЕНИЕ ПАРОЛЯ ---
app.post('/api/update-password', async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        // Проверяем старый пароль
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Старый пароль неверен' });

        // Хешируем и сохраняем новый
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Пароль обновлен!' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при смене пароля' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server on port ${PORT}`);
});

// Пинг для предотвращения сна на Render (каждые 14 минут)
setInterval(() => {
    https.get('https://krasdeko.onrender.com', (res) => {
        console.log('Self-ping OK:', res.statusCode);
    }).on('error', (e) => {
        console.log('Self-ping Error:', e.message);
    });
}, 840000);
