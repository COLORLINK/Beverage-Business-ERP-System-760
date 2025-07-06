// Dashboard specific functionality
window.Dashboard = {
    charts: {},
    
    async init() {
        await this.loadStats();
        await this.loadRevenueTrend();
        await this.loadTopProducts();
    },

    async loadStats() {
        try {
            const response = await window.api.getDashboardStats();
            if (response.success) {
                this.updateStatsDisplay(response.data);
            } else {
                console.error('Failed to load dashboard stats:', response.message);
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            this.showStatsError();
        }
    },

    updateStatsDisplay(stats) {
        document.getElementById('total-revenue').textContent = 
            `$${parseFloat(stats.total_revenue || 0).toFixed(2)}`;
        document.getElementById('total-sales').textContent = 
            stats.total_sales || '0';
        document.getElementById('total-products').textContent = 
            stats.total_products || '0';
        document.getElementById('total-employees').textContent = 
            stats.total_employees || '0';
    },

    showStatsError() {
        document.getElementById('total-revenue').textContent = 'Error';
        document.getElementById('total-sales').textContent = 'Error';
        document.getElementById('total-products').textContent = 'Error';
        document.getElementById('total-employees').textContent = 'Error';
    },

    async loadRevenueTrend() {
        try {
            const response = await window.api.getRevenueTrend();
            if (response.success) {
                this.renderRevenueChart(response.data);
            } else {
                console.error('Failed to load revenue trend:', response.message);
            }
        } catch (error) {
            console.error('Failed to load revenue trend:', error);
            this.showChartError('revenue-chart');
        }
    },

    renderRevenueChart(data) {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Revenue',
                    data: data.map(item => parseFloat(item.revenue)),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: $' + context.parsed.y.toFixed(2);
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    },

    async loadTopProducts() {
        try {
            const response = await window.api.getTopProducts();
            if (response.success) {
                this.renderTopProducts(response.data);
            } else {
                console.error('Failed to load top products:', response.message);
            }
        } catch (error) {
            console.error('Failed to load top products:', error);
            this.showTopProductsError();
        }
    },

    renderTopProducts(products) {
        const container = document.getElementById('top-products-list');
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No sales data available</p></div>';
            return;
        }

        products.forEach((product, index) => {
            const item = document.createElement('div');
            item.className = 'product-item';
            
            const rankColor = index === 0 ? '#f39c12' : index === 1 ? '#95a5a6' : index === 2 ? '#e67e22' : '#bdc3c7';
            
            item.innerHTML = `
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p style="color: ${rankColor};">#${index + 1} Best Seller</p>
                </div>
                <div class="product-sales">
                    <div class="amount">$${parseFloat(product.total_revenue).toFixed(2)}</div>
                    <div class="quantity">${product.total_quantity} sold</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    },

    showTopProductsError() {
        const container = document.getElementById('top-products-list');
        container.innerHTML = '<div class="empty-state"><p>Failed to load top products</p></div>';
    },

    showChartError(chartId) {
        const canvas = document.getElementById(chartId);
        const container = canvas.parentElement;
        container.innerHTML = '<div class="empty-state"><p>Failed to load chart data</p></div>';
    },

    async updateStats() {
        await this.loadStats();
        await this.loadRevenueTrend();
        await this.loadTopProducts();
    }
};

// Sales chart for reports page
window.SalesChart = {
    chart: null,

    render(data) {
        const ctx = document.getElementById('sales-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Sales',
                    data: data.map(item => parseFloat(item.sales)),
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Sales: $' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
};

// Currency formatting utility
window.formatCurrency = function(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Date formatting utility
window.formatDate = function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Auto-refresh dashboard data every 5 minutes
setInterval(() => {
    if (window.Dashboard && document.getElementById('page-dashboard').classList.contains('active')) {
        window.Dashboard.updateStats();
    }
}, 5 * 60 * 1000);