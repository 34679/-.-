/**
 * Пассажирам.РФ — app.js
 * Коммит 1: storage, validator, auth (регистрация и вход)
 */

// ==========================================
// ХРАНИЛИЩЕ ДАННЫХ
// ==========================================

const storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    init() {
        if (!this.get('users'))    this.set('users', []);
        if (!this.get('requests')) this.set('requests', []);
        if (!this.get('reviews'))  this.set('reviews', []);

        // Создаём администратора по умолчанию
        const users = this.get('users') || [];
        if (!users.find(u => u.login === 'Admin26')) {
            users.push({
                id: 'admin_' + Date.now(),
                login: 'Admin26',
                password: 'Demo20',
                fio: 'Администратор',
                birthdate: '01.01.1990',
                phone: '+7 (495) 123-45-67',
                email: 'admin@passazhiram.rf',
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
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10) return 'Некорректный номер телефона';
        return null;
    },
    email(value) {
        if (!value) return 'Введите e-mail';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Некорректный e-mail адрес';
        return null;
    },
    clearErrors(prefix) {
        document.querySelectorAll(`[id^="${prefix}-"][id$="-error"]`).forEach(el => {
            el.textContent = '';
        });
    },
    showError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        if (errorEl) errorEl.textContent = message;
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
    getCurrentUser() {
        return storage.get('currentUser');
    },
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

        const loginErr = validator.login(login);
        if (loginErr) { validator.showError('reg-login', loginErr); hasErrors = true; }

        const passErr = validator.password(password);
        if (passErr) { validator.showError('reg-password', passErr); hasErrors = true; }

        const fioErr = validator.fio(fio);
        if (fioErr) { validator.showError('reg-fio', fioErr); hasErrors = true; }

        const bdErr = validator.birthdate(birthdate);
        if (bdErr) { validator.showError('reg-birthdate', bdErr); hasErrors = true; }

        const phoneErr = validator.phone(phone);
        if (phoneErr) { validator.showError('reg-phone', phoneErr); hasErrors = true; }

        const emailErr = validator.email(email);
        if (emailErr) { validator.showError('reg-email', emailErr); hasErrors = true; }

        if (hasErrors) return;

        const users = storage.get('users') || [];
        if (users.find(u => u.login.toLowerCase() === login.toLowerCase())) {
            validator.showError('reg-login', 'Этот логин уже занят');
            return;
        }

        const newUser = {
            id: 'user_' + Date.now(),
            login, password, fio, birthdate, phone, email,
            isAdmin: false
        };

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

        if (!login) { validator.showError('login-login', 'Введите логин'); return; }
        if (!password) { validator.showError('login-password', 'Введите пароль'); return; }

        const users = storage.get('users') || [];
        const user  = users.find(u => u.login === login && u.password === password);

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
