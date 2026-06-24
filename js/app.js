/**
 * Пассажирам.РФ — app.js
 * Коммит 2: добавлены dashboard.loadRequests, requests.handleSubmit, auth.logout
 */

// ==========================================
// ХРАНИЛИЩЕ ДАННЫХ
// ==========================================

const storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem(key); },
    init() {
        if (!this.get('users'))    this.set('users', []);
        if (!this.get('requests')) this.set('requests', []);
        if (!this.get('reviews'))  this.set('reviews', []);

        const users = this.get('users') || [];
        if (!users.find(u => u.login === 'Admin26')) {
            users.push({
                id: 'admin_' + Date.now(),
                login: 'Admin26', password: 'Demo20',
                fio: 'Администратор', birthdate: '01.01.1990',
                phone: '+7 (495) 123-45-67', email: 'admin@passazhiram.rf',
                isAdmin: true
            });
            this.set('users', users);
        }
    }
};

// ==========================================
// ВАЛИДАЦИЯ
// ==========================================

const validator = {
    login(value) {
        if (!value || value.length < 6) return 'Логин должен содержать минимум 6 символов';
        if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Логин должен содержать только латинские буквы и цифры';
        return null;
    },
    password(value) {
        if (!value || value.length < 8) return 'Пароль должен содержать минимум 8 символов';
        return null;
    },
    fio(value) {
        if (!value || value.trim().length < 3) return 'Введите корректное ФИО';
        return null;
    },
    birthdate(value) {
        if (!value) return 'Введите дату рождения';
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return 'Формат: ДД.ММ.ГГГГ';
        return null;
    },
    phone(value) {
        if (!value) return 'Введите номер телефона';
        if (value.replace(/\D/g, '').length < 10) return 'Некорректный номер телефона';
        return null;
    },
    email(value) {
        if (!value) return 'Введите e-mail';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Некорректный e-mail адрес';
        return null;
    },
    transport(value) {
        if (!value) return 'Выберите вид транспорта';
        return null;
    },
    startDate(value) {
        if (!value) return 'Введите дату начала обучения';
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return 'Формат: ДД.ММ.ГГГГ';
        return null;
    },
    payment(value) {
        if (!value) return 'Выберите способ оплаты';
        return null;
    },
    clearErrors(prefix) {
        document.querySelectorAll(`[id^="${prefix}-"][id$="-error"]`).forEach(el => {
            el.textContent = '';
        });
    },
    showError(fieldId, message) {
        const el = document.getElementById(fieldId + '-error');
        if (el) el.textContent = message;
    }
};

// ==========================================
// НАВИГАЦИЯ
// ==========================================

const nav = {
    init() {
        const user = auth.getCurrentUser();
        const isAdmin = auth.isAdmin();
        document.querySelectorAll('.auth-hidden').forEach(el => {
            el.style.display = user ? 'none' : '';
        });
        document.querySelectorAll('.auth-visible').forEach(el => {
            el.style.display = user ? '' : 'none';
        });
        document.querySelectorAll('.admin-visible').forEach(el => {
            el.style.display = isAdmin ? '' : 'none';
        });
    }
};

// ==========================================
// АУТЕНТИФИКАЦИЯ
// ==========================================

const auth = {
    getCurrentUser() { return storage.get('currentUser'); },
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.isAdmin;
    },
    handleRegister(event) {
        event.preventDefault();
        validator.clearErrors('reg');

        const login     = document.getElementById('reg-login').value.trim();
        const password  = document.getElementById('reg-password').value;
        const fio       = document.getElementById('reg-fio').value.trim();
        const birthdate = document.getElementById('reg-birthdate').value.trim();
        const phone     = document.getElementById('reg-phone').value.trim();
        const email     = document.getElementById('reg-email').value.trim();

        let hasErrors = false;
        const checks = [
            ['reg-login',     validator.login(login)],
            ['reg-password',  validator.password(password)],
            ['reg-fio',       validator.fio(fio)],
            ['reg-birthdate', validator.birthdate(birthdate)],
            ['reg-phone',     validator.phone(phone)],
            ['reg-email',     validator.email(email)],
        ];
        checks.forEach(([id, err]) => { if (err) { validator.showError(id, err); hasErrors = true; } });
        if (hasErrors) return;

        const users = storage.get('users') || [];
        if (users.find(u => u.login.toLowerCase() === login.toLowerCase())) {
            validator.showError('reg-login', 'Этот логин уже занят');
            return;
        }

        const newUser = { id: 'user_' + Date.now(), login, password, fio, birthdate, phone, email, isAdmin: false };
        users.push(newUser);
        storage.set('users', users);
        storage.set('currentUser', newUser);
        alert('Регистрация прошла успешно!');
        window.location.href = 'dashboard.html';
    },
    handleLogin(event) {
        event.preventDefault();
        validator.clearErrors('login');

        const login    = document.getElementById('login-login').value.trim();
        const password = document.getElementById('login-password').value;

        if (!login)    { validator.showError('login-login', 'Введите логин'); return; }
        if (!password) { validator.showError('login-password', 'Введите пароль'); return; }

        const user = (storage.get('users') || []).find(u => u.login === login && u.password === password);
        if (!user) {
            validator.showError('login-login', 'Проверьте логин');
            validator.showError('login-password', 'Неверный логин или пароль');
            return;
        }

        storage.set('currentUser', user);
        window.location.href = user.isAdmin ? 'admin.html' : 'dashboard.html';
    },
    logout() {
        storage.remove('currentUser');
        window.location.href = 'index.html';
    }
};

// ==========================================
// ЛИЧНЫЙ КАБИНЕТ
// ==========================================

const dashboard = {
    loadRequests() {
        const user = auth.getCurrentUser();
        if (!user) return;

        const allRequests  = storage.get('requests') || [];
        const userRequests = allRequests.filter(r => r.userId === user.id);
        const container    = document.getElementById('userRequests');
        if (!container) return;

        if (userRequests.length === 0) {
            container.innerHTML = '<p>У вас пока нет заявок. <a href="request.html">Подать заявку</a></p>';
            return;
        }

        const reviews = storage.get('reviews') || [];

        container.innerHTML = userRequests.map(req => {
            const review    = reviews.find(r => r.requestId === req.id);
            const canReview = req.status === 'Обучение завершено' && !review;
            return `
                <div style="border:1px solid #ccc; margin:8px 0; padding:12px;">
                    <strong>Заявка №${req.number}</strong> — ${req.status}<br>
                    Транспорт: ${req.transport}<br>
                    Дата начала: ${req.startDate}<br>
                    Оплата: ${req.payment}<br>
                    Подана: ${req.createdAt}<br>
                    ${req.comment ? `Комментарий: ${req.comment}<br>` : ''}
                    ${canReview ? `<button onclick="reviews.openModal('${req.id}')">Оставить отзыв</button>` : ''}
                    ${review ? `<p>Ваш отзыв (${review.rating}★): ${review.text}</p>` : ''}
                </div>
            `;
        }).join('');
    }
};

// ==========================================
// ЗАЯВКИ
// ==========================================

const requests = {
    handleSubmit(event) {
        event.preventDefault();
        validator.clearErrors('req');

        const user = auth.getCurrentUser();
        if (!user) { alert('Требуется авторизация'); window.location.href = 'login.html'; return; }

        const transport = document.getElementById('req-transport').value;
        const startDate = document.getElementById('req-date').value.trim();
        const payment   = document.getElementById('req-payment').value;
        const comment   = document.getElementById('req-comment').value.trim();

        let hasErrors = false;
        const checks = [
            ['req-transport', validator.transport(transport)],
            ['req-date',      validator.startDate(startDate)],
            ['req-payment',   validator.payment(payment)],
        ];
        checks.forEach(([id, err]) => { if (err) { validator.showError(id, err); hasErrors = true; } });
        if (hasErrors) return;

        const allRequests = storage.get('requests') || [];
        const nextNumber  = allRequests.length > 0
            ? Math.max(...allRequests.map(r => r.number)) + 1 : 1;

        allRequests.push({
            id: 'req_' + Date.now(),
            number: nextNumber,
            userId: user.id, userLogin: user.login, userFio: user.fio,
            transport, startDate, payment, comment,
            status: 'Новая',
            createdAt: new Date().toLocaleString('ru-RU')
        });
        storage.set('requests', allRequests);

        alert('Заявка №' + nextNumber + ' успешно отправлена!');
        window.location.href = 'dashboard.html';
    }
};

// ==========================================
// ОТЗЫВЫ
// ==========================================

const reviews = {
    currentRating: 5,
    openModal(requestId) {
        const text = prompt('Оставьте ваш отзыв:');
        if (!text || !text.trim()) return;
        const rating = parseInt(prompt('Оценка от 1 до 5:')) || 5;

        const allReviews = storage.get('reviews') || [];
        allReviews.push({
            id: 'rev_' + Date.now(), requestId,
            rating, text: text.trim(),
            date: new Date().toLocaleString('ru-RU')
        });
        storage.set('reviews', allReviews);
        alert('Отзыв успешно оставлен!');
        dashboard.loadRequests();
    }
};
