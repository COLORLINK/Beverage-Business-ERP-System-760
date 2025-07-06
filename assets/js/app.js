// Main Application Logic
class ERPApp {
    constructor() {
        this.currentUser = null;
        this.isInstalled = false;
        this.currentPage = 'dashboard';
        this.init();
    }

    async init() {
        console.log('🚀 Initializing ERP System...');
        
        // Check installation status
        await this.checkInstallation();
        
        // Check authentication
        await this.checkAuth();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            this.showAppropriateScreen();
        }, 1000);

        // Initialize event listeners
        this.initEventListeners();
    }

    async checkInstallation() {
        try {
            const response = await fetch('api/check-installation.php');
            const data = await response.json();
            this.isInstalled = data.installed;
        } catch (error) {
            console.log('Installation check failed, assuming not installed');
            this.isInstalled = false;
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.currentUser = null;
            return;
        }

        try {
            const response = await fetch('api/auth/profile.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateUserInfo();
            } else {
                localStorage.removeItem('auth_token');
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.currentUser = null;
        }
    }

    showAppropriateScreen() {
        if (!this.isInstalled) {
            this.showScreen('installation-screen');
        } else if (!this.currentUser) {
            this.showScreen('login-screen');
        } else {
            this.showScreen('dashboard-screen');
            this.loadDashboardData();
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.remove('hidden');
        
        // Add fade-in animation
        document.getElementById(screenId).classList.add('fade-in');
    }

    initEventListeners() {
        // Installation form handlers
        this.initInstallationHandlers();
        
        // Login form handler
        this.initLoginHandler();
        
        // Dashboard handlers
        this.initDashboardHandlers();
        
        // Form submission handlers
        this.initFormHandlers();
    }

    initInstallationHandlers() {
        let currentStep = 1;
        const totalSteps = 3;

        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const installBtn = document.getElementById('install-btn');

        nextBtn?.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                if (this.validateInstallationStep(currentStep)) {
                    currentStep++;
                    this.showInstallationStep(currentStep);
                    this.updateInstallationButtons(currentStep, totalSteps);
                }
            }
        });

        prevBtn?.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                this.showInstallationStep(currentStep);
                this.updateInstallationButtons(currentStep, totalSteps);
            }
        });

        installBtn?.addEventListener('click', () => {
            this.performInstallation();
        });
    }

    showInstallationStep(step) {
        document.querySelectorAll('.step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        document.querySelector(`[data-step="${step}"]`).classList.add('active');
    }

    updateInstallationButtons(currentStep, totalSteps) {
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const installBtn = document.getElementById('install-btn');

        prevBtn.classList.toggle('hidden', currentStep === 1);
        nextBtn.classList.toggle('hidden', currentStep === totalSteps);
        installBtn.classList.toggle('hidden', currentStep !== totalSteps);
    }

    validateInstallationStep(step) {
        switch (step) {
            case 1:
                return this.validateDatabaseConfig();
            case 2:
                return this.validateAdminConfig();
            case 3:
                return this.validateCompanyConfig();
            default:
                return true;
        }
    }

    validateDatabaseConfig() {
        const form = document.getElementById('db-config-form');
        const formData = new FormData(form);
        
        const required = ['db_host', 'db_name', 'db_user'];
        for (let field of required) {
            if (!formData.get(field)) {
                this.showToast(`${field.replace('_', ' ')} is required`, 'error');
                return false;
            }
        }
        return true;
    }

    validateAdminConfig() {
        const form = document.getElementById('admin-form');
        const formData = new FormData(form);
        
        const password = formData.get('admin_password');
        const confirmPassword = formData.get('admin_password_confirm');
        
        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return false;
        }
        
        if (password.length < 8) {
            this.showToast('Password must be at least 8 characters', 'error');
            return false;
        }
        
        return true;
    }

    validateCompanyConfig() {
        const form = document.getElementById('company-form');
        const formData = new FormData(form);
        
        if (!formData.get('company_name')) {
            this.showToast('Company name is required', 'error');
            return false;
        }
        
        return true;
    }

    async performInstallation() {
        const installBtn = document.getElementById('install-btn');
        const originalText = installBtn.innerHTML;
        
        installBtn.disabled = true;
        installBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Installing...';

        try {
            // Collect all form data
            const dbForm = document.getElementById('db-config-form');
            const adminForm = document.getElementById('admin-form');
            const companyForm = document.getElementById('company-form');
            
            const dbData = new FormData(dbForm);
            const adminData = new FormData(adminForm);
            const companyData = new FormData(companyForm);
            
            const installData = {
                database: Object.fromEntries(dbData),
                admin: Object.fromEntries(adminData),
                company: Object.fromEntries(companyData)
            };

            const response = await fetch('api/install.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(installData)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Installation completed successfully!', 'success');
                this.isInstalled = true;
                
                // Auto-login with admin credentials
                setTimeout(() => {
                    this.showScreen('login-screen');
                }, 2000);
            } else {
                throw new Error(result.message || 'Installation failed');
            }
        } catch (error) {
            console.error('Installation error:', error);
            this.showToast(error.message || 'Installation failed', 'error');
        } finally {
            installBtn.disabled = false;
            installBtn.innerHTML = originalText;
        }
    }

    initLoginHandler() {
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e);
        });
    }

    async handleLogin(e) {
        const formData = new FormData(e.target);
        const loginData = Object.fromEntries(formData);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

        try {
            const response = await fetch('api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('auth_token', result.token);
                this.currentUser = result.user;
                this.updateUserInfo();
                this.showScreen('dashboard-screen');
                this.loadDashboardData();
                this.showToast('Login successful!', 'success');
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message || 'Login failed', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('user-role').textContent = this.currentUser.role;
        }
    }

    initDashboardHandlers() {
        // Sidebar toggle for mobile
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sidebar-toggle')) {
                this.toggleSidebar();
            }
        });
    }

    initFormHandlers() {
        // User form
        const userForm = document.getElementById('user-form');
        userForm?.addEventListener('submit', (e) => this.handleUserForm(e));

        // Product form
        const productForm = document.getElementById('product-form');
        productForm?.addEventListener('submit', (e) => this.handleProductForm(e));

        // Sale form
        const saleForm = document.getElementById('sale-form');
        saleForm?.addEventListener('submit', (e) => this.handleSaleForm(e));

        // Employee form
        const employeeForm = document.getElementById('employee-form');
        employeeForm?.addEventListener('submit', (e) => this.handleEmployeeForm(e));

        // Expense form
        const expenseForm = document.getElementById('expense-form');
        expenseForm?.addEventListener('submit', (e) => this.handleExpenseForm(e));
    }

    async handleUserForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);

        try {
            const response = await this.makeAuthenticatedRequest('api/users.php', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (response.success) {
                this.showToast('User created successfully!', 'success');
                this.closeModal('user-modal');
                this.loadUsers();
                e.target.reset();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to create user', 'error');
        }
    }

    async handleProductForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productData = Object.fromEntries(formData);

        try {
            const response = await this.makeAuthenticatedRequest('api/products.php', {
                method: 'POST',
                body: JSON.stringify(productData)
            });

            if (response.success) {
                this.showToast('Product created successfully!', 'success');
                this.closeModal('product-modal');
                this.loadProducts();
                e.target.reset();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to create product', 'error');
        }
    }

    async handleSaleForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const saleData = Object.fromEntries(formData);

        try {
            const response = await this.makeAuthenticatedRequest('api/sales.php', {
                method: 'POST',
                body: JSON.stringify(saleData)
            });

            if (response.success) {
                this.showToast('Sale recorded successfully!', 'success');
                this.closeModal('sale-modal');
                this.loadSales();
                this.updateDashboardStats();
                e.target.reset();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to record sale', 'error');
        }
    }

    async handleEmployeeForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const employeeData = Object.fromEntries(formData);

        try {
            const response = await this.makeAuthenticatedRequest('api/employees.php', {
                method: 'POST',
                body: JSON.stringify(employeeData)
            });

            if (response.success) {
                this.showToast('Employee added successfully!', 'success');
                this.closeModal('employee-modal');
                this.loadEmployees();
                e.target.reset();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to add employee', 'error');
        }
    }

    async handleExpenseForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const expenseData = Object.fromEntries(formData);

        try {
            const response = await this.makeAuthenticatedRequest('api/expenses.php', {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });

            if (response.success) {
                this.showToast('Expense recorded successfully!', 'success');
                this.closeModal('expense-modal');
                this.loadExpenses();
                e.target.reset();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to record expense', 'error');
        }
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const token = localStorage.getItem('auth_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401) {
            this.logout();
            return;
        }
        
        return await response.json();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="${iconMap[type]} icon"></i>
            <span class="message">${message}</span>
            <button class="close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.currentUser = null;
        this.showScreen('login-screen');
        this.showToast('Logged out successfully', 'info');
    }

    // Dashboard data loading methods will be implemented in dashboard.js
    async loadDashboardData() {
        if (window.Dashboard) {
            window.Dashboard.init();
        }
    }

    updateDashboardStats() {
        if (window.Dashboard) {
            window.Dashboard.updateStats();
        }
    }
}

// Modal management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // Load products for sale modal
    if (modalId === 'sale-modal') {
        loadProductsForSale();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Page navigation
function showPage(pageId) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[onclick="showPage('${pageId}')"]`).classList.add('active');
    
    // Show page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    
    // Load page data
    loadPageData(pageId);
}

async function loadPageData(pageId) {
    switch (pageId) {
        case 'users':
            await loadUsers();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'sales':
            await loadSales();
            break;
        case 'employees':
            await loadEmployees();
            break;
        case 'expenses':
            await loadExpenses();
            break;
        case 'reports':
            await loadReports();
            break;
    }
}

// Load products for sale modal
async function loadProductsForSale() {
    try {
        const app = window.erpApp;
        const response = await app.makeAuthenticatedRequest('api/products.php');
        
        if (response.success) {
            const select = document.getElementById('sale-product-select');
            select.innerHTML = '<option value="">Select Product</option>';
            
            response.data.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - $${product.price}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.erpApp = new ERPApp();
});

// Global functions for HTML onclick handlers
window.showModal = showModal;
window.closeModal = closeModal;
window.showPage = showPage;
window.toggleSidebar = () => window.erpApp.toggleSidebar();
window.logout = () => window.erpApp.logout();