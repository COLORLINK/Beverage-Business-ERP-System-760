// API Helper Functions
class APIClient {
    constructor() {
        this.baseURL = 'api/';
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
        }

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, mergedOptions);
            
            if (response.status === 401) {
                this.setToken(null);
                window.location.reload();
                return;
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw new Error('Network error occurred');
        }
    }

    // User management
    async getUsers() {
        return await this.request('users.php');
    }

    async createUser(userData) {
        return await this.request('users.php', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userId, userData) {
        return await this.request(`users.php?id=${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return await this.request(`users.php?id=${userId}`, {
            method: 'DELETE'
        });
    }

    // Product management
    async getProducts() {
        return await this.request('products.php');
    }

    async createProduct(productData) {
        return await this.request('products.php', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(productId, productData) {
        return await this.request(`products.php?id=${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(productId) {
        return await this.request(`products.php?id=${productId}`, {
            method: 'DELETE'
        });
    }

    // Sales management
    async getSales() {
        return await this.request('sales.php');
    }

    async createSale(saleData) {
        return await this.request('sales.php', {
            method: 'POST',
            body: JSON.stringify(saleData)
        });
    }

    async updateSale(saleId, saleData) {
        return await this.request(`sales.php?id=${saleId}`, {
            method: 'PUT',
            body: JSON.stringify(saleData)
        });
    }

    async deleteSale(saleId) {
        return await this.request(`sales.php?id=${saleId}`, {
            method: 'DELETE'
        });
    }

    // Employee management
    async getEmployees() {
        return await this.request('employees.php');
    }

    async createEmployee(employeeData) {
        return await this.request('employees.php', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    }

    async updateEmployee(employeeId, employeeData) {
        return await this.request(`employees.php?id=${employeeId}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    }

    async deleteEmployee(employeeId) {
        return await this.request(`employees.php?id=${employeeId}`, {
            method: 'DELETE'
        });
    }

    // Expense management
    async getExpenses() {
        return await this.request('expenses.php');
    }

    async createExpense(expenseData) {
        return await this.request('expenses.php', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    }

    async updateExpense(expenseId, expenseData) {
        return await this.request(`expenses.php?id=${expenseId}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData)
        });
    }

    async deleteExpense(expenseId) {
        return await this.request(`expenses.php?id=${expenseId}`, {
            method: 'DELETE'
        });
    }

    // Dashboard stats
    async getDashboardStats() {
        return await this.request('dashboard/stats.php');
    }

    async getRevenueTrend() {
        return await this.request('dashboard/revenue-trend.php');
    }

    async getTopProducts() {
        return await this.request('dashboard/top-products.php');
    }

    // Reports
    async getFinancialReport(startDate, endDate) {
        return await this.request(`reports/financial.php?start=${startDate}&end=${endDate}`);
    }

    async getSalesReport(startDate, endDate) {
        return await this.request(`reports/sales.php?start=${startDate}&end=${endDate}`);
    }

    // Settings
    async getSettings() {
        return await this.request('settings.php');
    }

    async updateSettings(settingsData) {
        return await this.request('settings.php', {
            method: 'PUT',
            body: JSON.stringify(settingsData)
        });
    }
}

// Create global API client instance
window.api = new APIClient();

// Data loading functions
async function loadUsers() {
    try {
        const response = await window.api.getUsers();
        if (response.success) {
            renderUsersTable(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        showErrorInTable('users-table', 'Failed to load users');
    }
}

async function loadProducts() {
    try {
        const response = await window.api.getProducts();
        if (response.success) {
            renderProductsGrid(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        showErrorInGrid('products-grid', 'Failed to load products');
    }
}

async function loadSales() {
    try {
        const response = await window.api.getSales();
        if (response.success) {
            renderSalesTable(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Failed to load sales:', error);
        showErrorInTable('sales-table', 'Failed to load sales');
    }
}

async function loadEmployees() {
    try {
        const response = await window.api.getEmployees();
        if (response.success) {
            renderEmployeesGrid(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Failed to load employees:', error);
        showErrorInGrid('employees-grid', 'Failed to load employees');
    }
}

async function loadExpenses() {
    try {
        const response = await window.api.getExpenses();
        if (response.success) {
            renderExpensesTable(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Failed to load expenses:', error);
        showErrorInTable('expenses-table', 'Failed to load expenses');
    }
}

async function loadReports() {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const [financialResponse, salesResponse] = await Promise.all([
            window.api.getFinancialReport(startDate, endDate),
            window.api.getSalesReport(startDate, endDate)
        ]);
        
        if (financialResponse.success) {
            renderFinancialSummary(financialResponse.data);
        }
        
        if (salesResponse.success) {
            renderSalesChart(salesResponse.data);
        }
    } catch (error) {
        console.error('Failed to load reports:', error);
        document.getElementById('financial-summary').innerHTML = 
            '<p class="text-center">Failed to load financial data</p>';
    }
}

// Rendering functions
function renderUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.role}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td class="actions">
                <button class="action-btn edit" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderProductsGrid(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No products found</p></div>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <div class="price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="category">${product.category}</div>
            <div class="description">${product.description || ''}</div>
            <div class="card-actions">
                <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderSalesTable(sales) {
    const tbody = document.querySelector('#sales-table tbody');
    tbody.innerHTML = '';

    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No sales found</td></tr>';
        return;
    }

    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="date">${new Date(sale.sale_date).toLocaleDateString()}</td>
            <td>${sale.product_name}</td>
            <td>${sale.quantity}</td>
            <td class="currency">$${parseFloat(sale.total_amount).toFixed(2)}</td>
            <td>${sale.customer_name || '-'}</td>
            <td class="actions">
                <button class="action-btn edit" onclick="editSale(${sale.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteSale(${sale.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderEmployeesGrid(employees) {
    const grid = document.getElementById('employees-grid');
    grid.innerHTML = '';

    if (employees.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No employees found</p></div>';
        return;
    }

    employees.forEach(employee => {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.innerHTML = `
            <h3>${employee.name}</h3>
            <div class="position">${employee.position}</div>
            <div class="salary">$${parseFloat(employee.salary).toFixed(2)}</div>
            <div class="contact">
                ${employee.email ? `<div><i class="fas fa-envelope"></i> ${employee.email}</div>` : ''}
                ${employee.phone ? `<div><i class="fas fa-phone"></i> ${employee.phone}</div>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-sm" onclick="editEmployee(${employee.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${employee.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderExpensesTable(expenses) {
    const tbody = document.querySelector('#expenses-table tbody');
    tbody.innerHTML = '';

    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No expenses found</td></tr>';
        return;
    }

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="date">${new Date(expense.expense_date).toLocaleDateString()}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td class="currency">$${parseFloat(expense.amount).toFixed(2)}</td>
            <td class="actions">
                <button class="action-btn edit" onclick="editExpense(${expense.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteExpense(${expense.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderFinancialSummary(data) {
    const container = document.getElementById('financial-summary');
    container.innerHTML = `
        <div class="financial-summary">
            <div class="summary-item positive">
                <h4>Total Revenue</h4>
                <div class="value">$${parseFloat(data.total_revenue || 0).toFixed(2)}</div>
            </div>
            <div class="summary-item negative">
                <h4>Total Expenses</h4>
                <div class="value">$${parseFloat(data.total_expenses || 0).toFixed(2)}</div>
            </div>
            <div class="summary-item ${(data.total_revenue - data.total_expenses) >= 0 ? 'positive' : 'negative'}">
                <h4>Net Profit</h4>
                <div class="value">$${parseFloat(data.total_revenue - data.total_expenses || 0).toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <h4>Sales Count</h4>
                <div class="value">${data.sales_count || 0}</div>
            </div>
        </div>
    `;
}

function renderSalesChart(data) {
    // This will be implemented in dashboard.js with Chart.js
    console.log('Sales chart data:', data);
}

function showErrorInTable(tableId, message) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const colCount = tbody.closest('table').querySelectorAll('th').length;
    tbody.innerHTML = `<tr><td colspan="${colCount}" class="text-center text-red">${message}</td></tr>`;
}

function showErrorInGrid(gridId, message) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = `<div class="empty-state"><p class="text-red">${message}</p></div>`;
}

// CRUD operation handlers
async function editUser(userId) {
    // Implementation for editing users
    console.log('Edit user:', userId);
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await window.api.deleteUser(userId);
            if (response.success) {
                window.erpApp.showToast('User deleted successfully', 'success');
                loadUsers();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            window.erpApp.showToast(error.message || 'Failed to delete user', 'error');
        }
    }
}

async function editProduct(productId) {
    console.log('Edit product:', productId);
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await window.api.deleteProduct(productId);
            if (response.success) {
                window.erpApp.showToast('Product deleted successfully', 'success');
                loadProducts();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            window.erpApp.showToast(error.message || 'Failed to delete product', 'error');
        }
    }
}

async function editSale(saleId) {
    console.log('Edit sale:', saleId);
}

async function deleteSale(saleId) {
    if (confirm('Are you sure you want to delete this sale?')) {
        try {
            const response = await window.api.deleteSale(saleId);
            if (response.success) {
                window.erpApp.showToast('Sale deleted successfully', 'success');
                loadSales();
                window.erpApp.updateDashboardStats();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            window.erpApp.showToast(error.message || 'Failed to delete sale', 'error');
        }
    }
}

async function editEmployee(employeeId) {
    console.log('Edit employee:', employeeId);
}

async function deleteEmployee(employeeId) {
    if (confirm('Are you sure you want to delete this employee?')) {
        try {
            const response = await window.api.deleteEmployee(employeeId);
            if (response.success) {
                window.erpApp.showToast('Employee deleted successfully', 'success');
                loadEmployees();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            window.erpApp.showToast(error.message || 'Failed to delete employee', 'error');
        }
    }
}

async function editExpense(expenseId) {
    console.log('Edit expense:', expenseId);
}

async function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            const response = await window.api.deleteExpense(expenseId);
            if (response.success) {
                window.erpApp.showToast('Expense deleted successfully', 'success');
                loadExpenses();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            window.erpApp.showToast(error.message || 'Failed to delete expense', 'error');
        }
    }
}

// Make functions globally available
window.loadUsers = loadUsers;
window.loadProducts = loadProducts;
window.loadSales = loadSales;
window.loadEmployees = loadEmployees;
window.loadExpenses = loadExpenses;
window.loadReports = loadReports;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editSale = editSale;
window.deleteSale = deleteSale;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;