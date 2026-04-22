const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();

// Твоя ссылка для подключения (ЗАМЕНИ ТВОЙ_ПАРОЛЬ НА СВОЙ)
const mongoURI = 'mongodb+srv://JustGreenFicus:ТВОЙ_ПАРОЛЬ@krasdecobase.axx0rgf.mongodb.net/krasdeco?retryWrites=true&w=majority&appName=KrasDecoBase';

// Подключение к облачной базе данных
mongoose.connect(mongoURI)
    .then(() => console.log('Успешное подключение к MongoDB Atlas'))
    .catch(err => console.error('Ошибка подключения к базе:', err));

// Описание того, как выглядит "Пользователь" в базе данных
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- ЭНДПОИНТ РЕГИСТРАЦИИ ---
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Шифруем пароль перед сохранением
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword 
        });

        await newUser.save();
        res.json({ message: 'Аккаунт успешно создан и сохранен в облаке!' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Ошибка: такой логин уже существует' });
    }
});

// --- ЭНДПОИНТ ВХОДА ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Ищем пользователя в базе по имени
        const user = await User.findOne({ username });
        
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ 
                message: 'Вход выполнен успешно!', 
                user: { username: user.username } 
            });
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
    console.log(`Сервер Kras Deco запущен на порту ${PORT}`);
});
