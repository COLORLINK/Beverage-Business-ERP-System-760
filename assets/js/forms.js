// Form handling and validation
window.FormValidator = {
    rules: {
        required: (value) => value.trim() !== '',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        minLength: (min) => (value) => value.length >= min,
        maxLength: (max) => (value) => value.length <= max,
        numeric: (value) => !isNaN(value) && parseFloat(value) >= 0,
        password: (value) => value.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)
    },

    validate(form, rules) {
        const errors = {};
        const formData = new FormData(form);

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = formData.get(field) || '';
            
            for (const rule of fieldRules) {
                let isValid = false;
                let errorMessage = '';

                if (typeof rule === 'string') {
                    isValid = this.rules[rule](value);
                    errorMessage = this.getErrorMessage(rule, field);
                } else if (typeof rule === 'object') {
                    const { type, param, message } = rule;
                    isValid = this.rules[type](param)(value);
                    errorMessage = message || this.getErrorMessage(type, field, param);
                }

                if (!isValid) {
                    errors[field] = errorMessage;
                    break;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    getErrorMessage(rule, field, param) {
        const messages = {
            required: `${this.formatFieldName(field)} is required`,
            email: 'Please enter a valid email address',
            minLength: `${this.formatFieldName(field)} must be at least ${param} characters`,
            maxLength: `${this.formatFieldName(field)} must be no more than ${param} characters`,
            numeric: `${this.formatFieldName(field)} must be a valid number`,
            password: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        };

        return messages[rule] || `${this.formatFieldName(field)} is invalid`;
    },

    formatFieldName(field) {
        return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    showErrors(form, errors) {
        // Clear existing errors
        form.querySelectorAll('.field-error').forEach(error => error.remove());
        form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));

        // Show new errors
        for (const [field, message] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.textContent = message;
                errorDiv.style.color = '#e74c3c';
                errorDiv.style.fontSize = '0.8rem';
                errorDiv.style.marginTop = '5px';
                
                input.parentNode.appendChild(errorDiv);
            }
        }
    },

    clearErrors(form) {
        form.querySelectorAll('.field-error').forEach(error => error.remove());
        form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    }
};

// Form validation rules for each form
window.ValidationRules = {
    user: {
        name: ['required', { type: 'minLength', param: 2 }],
        email: ['required', 'email'],
        role: ['required'],
        password: ['required', 'password']
    },

    product: {
        name: ['required', { type: 'minLength', param: 2 }],
        price: ['required', 'numeric'],
        category: ['required']
    },

    sale: {
        product_id: ['required'],
        quantity: ['required', 'numeric'],
        sale_date: ['required']
    },

    employee: {
        name: ['required', { type: 'minLength', param: 2 }],
        position: ['required'],
        salary: ['required', 'numeric']
    },

    expense: {
        description: ['required'],
        amount: ['required', 'numeric'],
        category: ['required'],
        expense_date: ['required']
    },

    admin: {
        admin_name: ['required', { type: 'minLength', param: 2 }],
        admin_email: ['required', 'email'],
        admin_password: ['required', 'password'],
        admin_password_confirm: ['required']
    },

    company: {
        company_name: ['required', { type: 'minLength', param: 2 }]
    },

    database: {
        db_host: ['required'],
        db_name: ['required'],
        db_user: ['required']
    }
};

// Form enhancement
window.FormEnhancer = {
    init() {
        this.addRealTimeValidation();
        this.addFormSubmissionHandling();
        this.addFieldEnhancements();
    },

    addRealTimeValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        });
    },

    validateField(field) {
        const form = field.closest('form');
        const formId = form.id.replace('-form', '').replace('_', '');
        const rules = window.ValidationRules[formId];
        
        if (!rules || !rules[field.name]) return;

        const fieldRules = { [field.name]: rules[field.name] };
        const validation = window.FormValidator.validate(form, fieldRules);
        
        // Clear previous errors for this field
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
        field.classList.remove('error');

        // Show new error if any
        if (!validation.isValid && validation.errors[field.name]) {
            field.classList.add('error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = validation.errors[field.name];
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.style.marginTop = '5px';
            
            field.parentNode.appendChild(errorDiv);
        }
    },

    addFormSubmissionHandling() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id.replace('-form', '').replace('_', '');
            const rules = window.ValidationRules[formId];
            
            if (rules) {
                const validation = window.FormValidator.validate(form, rules);
                
                if (!validation.isValid) {
                    e.preventDefault();
                    window.FormValidator.showErrors(form, validation.errors);
                    
                    // Scroll to first error
                    const firstError = form.querySelector('.error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                    
                    return false;
                }
            }
        });
    },

    addFieldEnhancements() {
        // Auto-format currency fields
        document.addEventListener('input', (e) => {
            if (e.target.matches('[name="price"], [name="salary"], [name="amount"]')) {
                this.formatCurrencyField(e.target);
            }
        });

        // Auto-format phone fields
        document.addEventListener('input', (e) => {
            if (e.target.matches('[name*="phone"]')) {
                this.formatPhoneField(e.target);
            }
        });

        // Auto-capitalize name fields
        document.addEventListener('input', (e) => {
            if (e.target.matches('[name*="name"]:not([name*="user"]):not([name*="company"])')) {
                this.capitalizeName(e.target);
            }
        });
    },

    formatCurrencyField(field) {
        let value = field.value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        field.value = value;
    },

    formatPhoneField(field) {
        let value = field.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        
        field.value = value;
    },

    capitalizeName(field) {
        const words = field.value.split(' ');
        const capitalizedWords = words.map(word => {
            if (word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word;
        });
        field.value = capitalizedWords.join(' ');
    }
};

// Password strength indicator
window.PasswordStrength = {
    init() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('[name*="password"]:not([name*="confirm"])')) {
                this.updateStrengthIndicator(e.target);
            }
        });
    },

    updateStrengthIndicator(field) {
        let indicator = field.parentNode.querySelector('.password-strength');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'password-strength';
            indicator.style.marginTop = '5px';
            field.parentNode.appendChild(indicator);
        }

        const strength = this.calculateStrength(field.value);
        indicator.innerHTML = this.renderStrengthBar(strength);
    },

    calculateStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Uppercase letter');

        if (/\d/.test(password)) score += 1;
        else feedback.push('Number');

        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        else feedback.push('Special character');

        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'];

        return {
            score,
            level: levels[Math.min(score, 4)],
            color: colors[Math.min(score, 4)],
            feedback
        };
    },

    renderStrengthBar(strength) {
        const percentage = (strength.score / 5) * 100;
        
        return `
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem;">
                <div style="flex: 1; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: ${strength.color}; transition: all 0.3s ease;"></div>
                </div>
                <span style="color: ${strength.color}; font-weight: 600; min-width: 60px;">${strength.level}</span>
            </div>
            ${strength.feedback.length > 0 ? 
                `<div style="font-size: 0.75rem; color: #666; margin-top: 2px;">
                    Missing: ${strength.feedback.join(', ')}
                </div>` : ''
            }
        `;
    }
};

// Initialize form enhancements
document.addEventListener('DOMContentLoaded', () => {
    window.FormEnhancer.init();
    window.PasswordStrength.init();
});

// Auto-save form data to localStorage (for installation form)
window.FormAutoSave = {
    init() {
        const installationForms = ['db-config-form', 'admin-form', 'company-form'];
        
        installationForms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                this.loadSavedData(form);
                this.addAutoSave(form);
            }
        });
    },

    addAutoSave(form) {
        form.addEventListener('input', (e) => {
            this.saveFormData(form);
        });
    },

    saveFormData(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        localStorage.setItem(`form_${form.id}`, JSON.stringify(data));
    },

    loadSavedData(form) {
        const saved = localStorage.getItem(`form_${form.id}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                for (const [name, value] of Object.entries(data)) {
                    const field = form.querySelector(`[name="${name}"]`);
                    if (field && field.type !== 'password') {
                        field.value = value;
                    }
                }
            } catch (error) {
                console.error('Failed to load saved form data:', error);
            }
        }
    },

    clearSavedData() {
        const installationForms = ['db-config-form', 'admin-form', 'company-form'];
        installationForms.forEach(formId => {
            localStorage.removeItem(`form_${formId}`);
        });
    }
};

// Initialize auto-save
document.addEventListener('DOMContentLoaded', () => {
    window.FormAutoSave.init();
});