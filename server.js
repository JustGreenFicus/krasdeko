const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
    password: { type: String, required: true },
    phone: { type: String, default: "" }, 
    resetToken: String,
    resetTokenExpiry: Date
});

const User = mongoose.model('User', userSchema);

// --- НАСТРОЙКА ПОЧТЫ ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'babushkin.kirill2014@gmail.com',
        pass: 'abcd efgh ijkl mnop' // ВАЖНО: здесь должен быть твой пароль приложения
    }
});

// Вспомогательная функция для очистки телефона (оставляем только цифры)
const cleanPhone = (phone) => phone ? phone.replace(/\D/g, '') : "";

// --- API: РЕГИСТРАЦИЯ ---
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Этот логин уже занят' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword,
            phone: cleanPhone(phone) // Сохраняем только цифры: 79676528020
        });
        await newUser.save();
        res.json({ message: 'Аккаунт создан!', user: { id: newUser._id, username, email, phone: newUser.phone } });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
});

// --- API: ВХОД ---
app.post('/api/login', async (req, res) => {
    try {
        let { identifier, password } = req.body;
        
        // Очищаем то, что ввел пользователь, на случай если он ввел телефон со скобками
        const processedIdentifier = cleanPhone(identifier);

        const user = await User.findOne({ 
            $or: [
                { username: identifier }, 
                { phone: processedIdentifier } // Ищем по чистым цифрам
            ] 
        });

        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ 
                message: 'Успешно!', 
                user: { 
                    id: user._id, 
                    username: user.username, 
                    email: user.email,
                    phone: user.phone 
                } 
            });
        } else {
            res.status(400).json({ message: 'Неверный логин или пароль' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при входе' });
    }
});

// --- API: ОБНОВЛЕНИЕ ПРОФИЛЯ ---
app.post('/api/update-profile', async (req, res) => {
    try {
        const { userId, field, value } = req.body;
        
        if (field === 'username') {
            const busy = await User.findOne({ 
                username: value, 
                _id: { $ne: userId }
            });
            if (busy) return res.status(400).json({ message: 'Этот никнейм уже занят' });
        }

        let updateData = {};
        if (field === 'password') {
            updateData[field] = await bcrypt.hash(value, 10);
        } else if (field === 'phone') {
            updateData[field] = cleanPhone(value); // При обновлении тоже чистим формат
        } else {
            updateData[field] = value;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        res.json({ 
            message: 'Данные обновлены!', 
            user: { id: user._id, username: user.username, email: user.email, phone: user.phone } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
});

// --- API: ЗАБЫЛИ ПАРОЛЬ ---
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();

        const resetLink = `https://krasdeko.onrender.com/reset-password.html?token=${token}`;
        const mailOptions = {
            from: 'Kras Deco Support <babushkin.kirill2014@gmail.com>',
            to: user.email,
            subject: 'Сброс пароля Kras Deco',
            text: `Для сброса пароля перейдите по ссылке: ${resetLink}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Ссылка отправлена на почту!' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка почтового сервиса' });
    }
});

// --- API: СБРОС ПАРОЛЯ ---
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({ 
            resetToken: token, 
            resetTokenExpiry: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: 'Ссылка недействительна или просрочена' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Пароль успешно изменен!' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Пинг для предотвращения сна сервера
setInterval(() => {
    https.get('https://krasdeko.onrender.com', (res) => {
        console.log('Self-ping OK');
    }).on('error', (e) => console.log('Ping Error'));
}, 840000);
