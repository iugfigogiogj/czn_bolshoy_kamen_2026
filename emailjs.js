// ========== EMAILJS ДЛЯ ОТПРАВКИ ФОРМ ==========

// Инициализация EmailJS
(function() {
    emailjs.init("5S99w9YbtL3ro5-tJ"); // Получишь на emailjs.com
})();

// Функция отправки формы обращения
async function sendAppealForm(formData) {
    const statusDiv = document.getElementById('appealFormStatus');
    
    // Показываем статус отправки
    showStatus(statusDiv, '⏳ Отправка...', 'info');
    
    // Шаблон письма для EmailJS
    const templateParams = {
        to_email: 'czn.bolshoykamen.25@gmail.com', // Кому отправляем
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'Не указан',
        category: formData.category,
        message: formData.message,
        date: new Date().toLocaleString('ru-RU'),
        reply_to: formData.email
    };

    try {
        // Отправка через EmailJS
        const response = await emailjs.send(
            'service_n2fkwm5',      // Твой Service ID
            'template_7kd34rr',     // Твой Template ID
            templateParams
        );

        if (response.status === 200) {
            // УСПЕХ - показываем и скрываем через 2 секунды
            showStatus(statusDiv, '✅ Обращение успешно отправлено!', 'success');
            
            // Автоматически скрываем через 2 секунды
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 2000);
            
            return true;
        } else {
            throw new Error('Ошибка отправки');
        }
    } catch (error) {
        console.error('EmailJS Error:', error);
        showStatus(statusDiv, '❌ Ошибка при отправке. Попробуйте позже.', 'error');
        
        // Тоже скрываем через 3 секунды
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
        
        return false;
    }
}

// Вспомогательная функция для показа статуса
function showStatus(element, message, type) {
    if (element) {
        element.textContent = message;
        element.className = 'form-status ' + type;
        element.style.display = 'block';
        element.style.position = 'relative'; // Убираем fixed
        element.style.top = 'auto';
        element.style.left = 'auto';
        element.style.transform = 'none';
        element.style.zIndex = '100';
    }
}

// Инициализация формы
function initAppealForm() {
    const form = document.getElementById('appealForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Проверка согласия
        const consent = document.getElementById('appealConsent');
        if (!consent.checked) {
            alert('Необходимо дать согласие на обработку данных');
            return;
        }

        // Собираем данные
        const formData = {
            name: document.getElementById('appealName').value,
            email: document.getElementById('appealEmail').value,
            phone: document.getElementById('appealPhone').value,
            category: document.getElementById('appealCategory').value,
            message: document.getElementById('appealMessage').value
        };

        // Блокируем кнопку
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        // Отправляем
        const success = await sendAppealForm(formData);

        if (success) {
            form.reset();
        }

        // Разблокируем кнопку через 2 секунды
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 2000);
    });
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', initAppealForm);