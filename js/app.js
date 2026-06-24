/**
 * Пассажирам.РФ — Основной JavaScript
 * Многостраничная версия с localStorage
 */

// ==========================================
// ХРАНИЛИЩЕ ДАННЫХ (localStorage)
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
        if (!this.get('users')) {
            this.set('users', []);
        }
        if (!this.get('requests')) {
            this.set('requests', []);
        }
        if (!this.get('reviews')) {
            this.set('reviews', []);
        }
        // Создаём администратора по умолчанию
        const users = this.get('users') || [];
        if (!users.find(u => u.login === 'Admin26')) {
            users.push({
                login: 'Admin26',
                password: 'Demo20',
                fio: 'Администратор',
                birthdate: '01.01.1990',
                phone: '+7 (495) 123-45-67',
                email: 'admin@passazhiram.rf',
                isAdmin: true,
                id: 'admin_' + Date.now()
            });
            this.set('users', users);
        }
    }
};

// ==========================================
// УВЕДОМЛЕНИЯ
// ==========================================

const notify = {
    container: null,
    init() {
        this.container = document.getElementById('notifications');
    },
    show(message, type = 'info', duration = 5000) {
        if (!this.container) this.init();
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        notification.innerHTML = `
            <span>${icons[type] || 'ℹ'}</span>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        this.container.appendChild(notification);
        if (duration > 0) {
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(120%)';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
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
        if (!/^[а-яА-ЯёЁ\s-]+$/.test(value.trim())) return 'ФИО должно содержать только русские буквы';
        return null;
    },
    birthdate(value) {
        if (!value) return 'Введите дату рождения';
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return 'Формат: ДД.ММ.ГГГГ';
        const parts = value.split('.');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2020) {
            return 'Некорректная дата';
        }
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
    transport(value) {
        if (!value) return 'Выберите вид транспорта';
        return null;
    },
    startDate(value) {
        if (!value) return 'Введите дату начала обучения';
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return 'Формат: ДД.ММ.ГГГГ';
        const parts = value.split('.');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2026) {
            return 'Некорректная дата';
        }
        return null;
    },
    payment(value) {
        if (!value) return 'Выберите способ оплаты';
        return null;
    },
    clearErrors(formPrefix) {
        document.querySelectorAll(`[id^="${formPrefix}-"][id$="-error"]`).forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll(`[id^="${formPrefix}-"]`).forEach(el => {
            el.classList?.remove('error');
        });
    },
    showError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        const fieldEl = document.getElementById(fieldId);
        if (errorEl) errorEl.textContent = message;
        if (fieldEl) fieldEl.classList.add('error');
    }
};

// ==========================================
// МАСКИ ВВОДА
// ==========================================

const masks = {
    init() {
        // Маска для даты
        document.querySelectorAll('input[placeholder*="ДД.ММ.ГГГГ"]').forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 8) value = value.slice(0, 8);
                if (value.length >= 2) value = value.slice(0, 2) + '.' + value.slice(2);
                if (value.length >= 5) value = value.slice(0, 5) + '.' + value.slice(5);
                e.target.value = value;
            });
        });

        // Маска для телефона
        const phoneInput = document.getElementById('reg-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.startsWith('7') || value.startsWith('8')) {
                    value = value.slice(1);
                }
                if (value.length > 10) value = value.slice(0, 10);
                let formatted = '+7';
                if (value.length > 0) formatted += ' (' + value.slice(0, 3);
                if (value.length >= 3) formatted += ') ' + value.slice(3, 6);
                if (value.length >= 6) formatted += '-' + value.slice(6, 8);
                if (value.length >= 8) formatted += '-' + value.slice(8, 10);
                e.target.value = formatted;
            });
        }
    }
};

// ==========================================
// СЛАЙДЕР
// ==========================================

class Slider {
    constructor(containerId, dotsId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.slides = this.container.querySelectorAll('.slider-slide');
        this.dotsContainer = document.getElementById(dotsId);
        this.current = 0;
        this.autoplayInterval = null;
        this.init();
    }

    init() {
        if (this.dotsContainer) {
            this.slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
                dot.onclick = () => this.goTo(i);
                this.dotsContainer.appendChild(dot);
            });
        }
        this.startAutoplay();
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }

    goTo(index) {
        this.slides[this.current].classList.remove('active');
        this.current = index;
        if (this.current < 0) this.current = this.slides.length - 1;
        if (this.current >= this.slides.length) this.current = 0;
        this.slides[this.current].classList.add('active');
        this.updateDots();
    }

    next() { this.goTo(this.current + 1); }
    prev() { this.goTo(this.current - 1); }

    updateDots() {
        if (!this.dotsContainer) return;
        const dots = this.dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === this.current));
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.next(), 3000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// ==========================================
// НАВИГАЦИЯ (замена router.updateNav)
// ==========================================

const nav = {
    init() {
        const currentUser = auth.getCurrentUser();
        const isAdmin = auth.isAdmin();

        document.querySelectorAll('.auth-hidden').forEach(el => {
            el.style.display = currentUser ? 'none' : 'block';
        });
        document.querySelectorAll('.auth-visible').forEach(el => {
            el.style.display = currentUser ? 'block' : 'none';
        });
        document.querySelectorAll('.admin-visible').forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });

        // Мобильное меню
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
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

        const login = document.getElementById('reg-login').value.trim();
        const password = document.getElementById('reg-password').value;
        const fio = document.getElementById('reg-fio').value.trim();
        const birthdate = document.getElementById('reg-birthdate').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim();

        let hasErrors = false;

        const loginError = validator.login(login);
        if (loginError) { validator.showError('reg-login', loginError); hasErrors = true; }

        const passwordError = validator.password(password);
        if (passwordError) { validator.showError('reg-password', passwordError); hasErrors = true; }

        const fioError = validator.fio(fio);
        if (fioError) { validator.showError('reg-fio', fioError); hasErrors = true; }

        const birthdateError = validator.birthdate(birthdate);
        if (birthdateError) { validator.showError('reg-birthdate', birthdateError); hasErrors = true; }

        const phoneError = validator.phone(phone);
        if (phoneError) { validator.showError('reg-phone', phoneError); hasErrors = true; }

        const emailError = validator.email(email);
        if (emailError) { validator.showError('reg-email', emailError); hasErrors = true; }

        if (hasErrors) return;

        // Проверка уникальности логина
        const users = storage.get('users') || [];
        if (users.find(u => u.login.toLowerCase() === login.toLowerCase())) {
            validator.showError('reg-login', 'Этот логин уже занят');
            return;
        }

        // Создаём пользователя
        const newUser = {
            id: 'user_' + Date.now(),
            login,
            password,
            fio,
            birthdate,
            phone,
            email,
            isAdmin: false
        };

        users.push(newUser);
        storage.set('users', users);
        storage.set('currentUser', newUser);

        notify.success('Регистрация прошла успешно!');
        nav.init();
        setTimeout(() => window.location.href = 'dashboard.html', 500);
    },
    handleLogin(event) {
        event.preventDefault();
        validator.clearErrors('login');

        const login = document.getElementById('login-login').value.trim();
        const password = document.getElementById('login-password').value;

        let hasErrors = false;

        if (!login) {
            validator.showError('login-login', 'Введите логин');
            hasErrors = true;
        }
        if (!password) {
            validator.showError('login-password', 'Введите пароль');
            hasErrors = true;
        }
        if (hasErrors) return;

        const users = storage.get('users') || [];
        const user = users.find(u => u.login === login && u.password === password);

        if (!user) {
            notify.error('Неверный логин или пароль');
            validator.showError('login-login', 'Проверьте логин');
            validator.showError('login-password', 'Проверьте пароль');
            return;
        }

        storage.set('currentUser', user);
        notify.success('Добро пожаловать, ' + user.fio + '!');
        nav.init();

        if (user.isAdmin) {
            setTimeout(() => window.location.href = 'admin.html', 300);
        } else {
            setTimeout(() => window.location.href = 'dashboard.html', 300);
        }
    },
    logout() {
        storage.remove('currentUser');
        nav.init();
        notify.info('Вы вышли из системы');
        setTimeout(() => window.location.href = 'index.html', 300);
    }
};

// ==========================================
// ЛИЧНЫЙ КАБИНЕТ
// ==========================================

const dashboard = {
    loadRequests() {
        const user = auth.getCurrentUser();
        if (!user) return;

        const allRequests = storage.get('requests') || [];
        const userRequests = allRequests.filter(r => r.userId === user.id);
        const container = document.getElementById('userRequests');
        if (!container) return;

        if (userRequests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>У вас пока нет заявок</p>
                    <a href="request.html" class="btn btn-primary">Подать заявку</a>
                </div>
            `;
            return;
        }

        const reviews = storage.get('reviews') || [];

        container.innerHTML = userRequests.map(req => {
            const review = reviews.find(r => r.requestId === req.id);
            const statusClass = req.status === 'Новая' ? 'status-new' :
                               req.status === 'Идет обучение' ? 'status-progress' : 'status-completed';
            const canReview = req.status === 'Обучение завершено' && !review;

            return `
                <div class="request-card">
                    <div class="request-header">
                        <span class="request-number">Заявка №${req.number}</span>
                        <span class="request-status ${statusClass}">${req.status}</span>
                    </div>
                    <div class="request-details">
                        <div class="request-detail"><strong>Транспорт:</strong> ${req.transport}</div>
                        <div class="request-detail"><strong>Дата начала:</strong> ${req.startDate}</div>
                        <div class="request-detail"><strong>Оплата:</strong> ${req.payment}</div>
                        <div class="request-detail"><strong>Подана:</strong> ${req.createdAt}</div>
                    </div>
                    ${req.comment ? `<p class="request-detail"><strong>Комментарий:</strong> ${req.comment}</p>` : ''}
                    ${canReview ? `
                        <div class="request-actions">
                            <button class="btn btn-primary btn-sm" onclick="reviews.openModal('${req.id}')">
                                Оставить отзыв
                            </button>
                        </div>
                    ` : ''}
                    ${review ? `
                        <div class="review-section">
                            <div class="review-card">
                                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                                <p class="review-text">${review.text}</p>
                                <p class="review-date">${review.date}</p>
                            </div>
                        </div>
                    ` : ''}
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
        if (!user) {
            notify.error('Требуется авторизация');
            setTimeout(() => window.location.href = 'login.html', 500);
            return;
        }

        const transport = document.getElementById('req-transport').value;
        const startDate = document.getElementById('req-date').value.trim();
        const payment = document.getElementById('req-payment').value;
        const comment = document.getElementById('req-comment').value.trim();

        let hasErrors = false;

        const transportError = validator.transport(transport);
        if (transportError) { validator.showError('req-transport', transportError); hasErrors = true; }

        const dateError = validator.startDate(startDate);
        if (dateError) { validator.showError('req-date', dateError); hasErrors = true; }

        const paymentError = validator.payment(payment);
        if (paymentError) { validator.showError('req-payment', paymentError); hasErrors = true; }

        if (hasErrors) return;

        const allRequests = storage.get('requests') || [];
        const nextNumber = allRequests.length > 0
            ? Math.max(...allRequests.map(r => r.number)) + 1
            : 1;

        const newRequest = {
            id: 'req_' + Date.now(),
            number: nextNumber,
            userId: user.id,
            userLogin: user.login,
            userFio: user.fio,
            transport,
            startDate,
            payment,
            comment,
            status: 'Новая',
            createdAt: new Date().toLocaleString('ru-RU')
        };

        allRequests.push(newRequest);
        storage.set('requests', allRequests);

        notify.success('Заявка №' + nextNumber + ' успешно отправлена!');
        document.getElementById('requestForm').reset();
        setTimeout(() => window.location.href = 'dashboard.html', 500);
    }
};

// ==========================================
// ОТЗЫВЫ
// ==========================================

const reviews = {
    currentRating: 5,
    openModal(requestId) {
        document.getElementById('review-request-id').value = requestId;
        document.getElementById('reviewModal').style.display = 'flex';
        this.setRating(5);
        document.getElementById('review-text').value = '';
    },
    closeModal() {
        document.getElementById('reviewModal').style.display = 'none';
    },
    setRating(value) {
        this.currentRating = value;
        document.getElementById('review-rating').value = value;
        const stars = document.querySelectorAll('#ratingStars .star');
        stars.forEach((star, i) => {
            star.classList.toggle('active', i < value);
        });
    },
    handleSubmit(event) {
        event.preventDefault();
        const requestId = document.getElementById('review-request-id').value;
        const rating = parseInt(document.getElementById('review-rating').value);
        const text = document.getElementById('review-text').value.trim();

        if (!text) {
            notify.error('Введите текст отзыва');
            return;
        }

        const allReviews = storage.get('reviews') || [];
        allReviews.push({
            id: 'rev_' + Date.now(),
            requestId,
            rating,
            text,
            date: new Date().toLocaleString('ru-RU')
        });
        storage.set('reviews', allReviews);

        notify.success('Отзыв успешно оставлен!');
        this.closeModal();
        dashboard.loadRequests();
    }
};

// ==========================================
// МОДАЛЬНЫЕ ОКНА
// ==========================================

const modal = {
    close(modalId) {
        document.getElementById(modalId).style.display = 'none';
    },
    open(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }
};

// ==========================================
// АДМИН-ПАНЕЛЬ
// ==========================================

const admin = {
    currentPage: 1,
    itemsPerPage: 10,
    filteredRequests: [],

    load() {
        if (!auth.isAdmin()) {
            notify.error('Доступ запрещён');
            setTimeout(() => window.location.href = 'index.html', 500);
            return;
        }
        this.applyFilters();
    },

    applyFilters() {
        const statusFilter = document.getElementById('filterStatus').value;
        const transportFilter = document.getElementById('filterTransport').value;
        const searchFilter = document.getElementById('filterSearch').value.toLowerCase().trim();
        const sortBy = document.getElementById('sortBy').value;

        let reqs = storage.get('requests') || [];

        if (statusFilter) reqs = reqs.filter(r => r.status === statusFilter);
        if (transportFilter) reqs = reqs.filter(r => r.transport === transportFilter);
        if (searchFilter) {
            reqs = reqs.filter(r =>
                r.userFio.toLowerCase().includes(searchFilter) ||
                r.userLogin.toLowerCase().includes(searchFilter)
            );
        }

        reqs.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'fio': return a.userFio.localeCompare(b.userFio);
                case 'status': return a.status.localeCompare(b.status);
                default: return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        this.filteredRequests = reqs;
        this.currentPage = 1;
        this.render();
    },

    render() {
        this.renderStats();
        this.renderTable();
        this.renderPagination();
    },

    renderStats() {
        const reqs = storage.get('requests') || [];
        document.getElementById('statNew').textContent = reqs.filter(r => r.status === 'Новая').length;
        document.getElementById('statProgress').textContent = reqs.filter(r => r.status === 'Идет обучение').length;
        document.getElementById('statCompleted').textContent = reqs.filter(r => r.status === 'Обучение завершено').length;
    },

    renderTable() {
        const tbody = document.getElementById('adminTableBody');
        const emptyState = document.getElementById('adminEmpty');
        const table = document.getElementById('adminTable');

        if (this.filteredRequests.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredRequests.slice(start, end);

        tbody.innerHTML = pageItems.map(req => {
            const statusClass = req.status === 'Новая' ? 'status-new' :
                               req.status === 'Идет обучение' ? 'status-progress' : 'status-completed';
            return `
                <tr>
                    <td>${req.number}</td>
                    <td>${req.createdAt}</td>
                    <td>
                        <strong>${req.userFio}</strong><br>
                        <small style="color:var(--color-gray)">${req.userLogin}</small>
                    </td>
                    <td>${req.transport}</td>
                    <td>${req.startDate}</td>
                    <td>${req.payment}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${req.status}</span>
                    </td>
                    <td>
                        <select class="status-select" onchange="admin.changeStatus('${req.id}', this.value)">
                            <option value="Новая" ${req.status === 'Новая' ? 'selected' : ''}>Новая</option>
                            <option value="Идет обучение" ${req.status === 'Идет обучение' ? 'selected' : ''}>Идет обучение</option>
                            <option value="Обучение завершено" ${req.status === 'Обучение завершено' ? 'selected' : ''}>Обучение завершено</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderPagination() {
        const container = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        html += `<button class="page-btn" onclick="admin.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>←</button>`;

        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button class="page-btn" onclick="admin.goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="page-info">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="admin.goToPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="page-info">...</span>`;
            html += `<button class="page-btn" onclick="admin.goToPage(${totalPages})">${totalPages}</button>`;
        }

        html += `<button class="page-btn" onclick="admin.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>→</button>`;

        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredRequests.length);
        html += `<span class="page-info">${start}-${end} из ${this.filteredRequests.length}</span>`;

        container.innerHTML = html;
    },

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
        this.renderPagination();
    },

    changeStatus(requestId, newStatus) {
        const allRequests = storage.get('requests') || [];
        const request = allRequests.find(r => r.id === requestId);
        if (request) {
            const oldStatus = request.status;
            request.status = newStatus;
            storage.set('requests', allRequests);
            notify.success(`Статус заявки №${request.number} изменён: "${oldStatus}" → "${newStatus}"`);
            this.renderStats();
            this.renderTable();
        }
    }
};

// Переменная для слайдера главной страницы
let mainSlider;
