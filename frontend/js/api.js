// Centralized API client — handles auth tokens, fetch, and all API calls
const API_BASE_URL = 'http://localhost:3000/api';

const api = {

    // ── Core fetch wrapper with auth header ──
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem('mymart_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Request failed (${response.status})`);
        }

        return data;
    },

    // ── Products ──
    async getProducts() {
        return await this.fetch('/products');
    },

    async getProductById(id) {
        return await this.fetch(`/products/${id}`);
    },

    // ── Auth ──
    async login(email, password) {
        const data = await this.fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        localStorage.setItem('mymart_token', data.token);
        localStorage.setItem('mymart_user', JSON.stringify(data.user));
        return data;
    },

    async signup(name, email, password, mobile) {
        const data = await this.fetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, mobile })
        });
        localStorage.setItem('mymart_token', data.token);
        localStorage.setItem('mymart_user', JSON.stringify(data.user));
        return data;
    },

    logout() {
        localStorage.removeItem('mymart_token');
        localStorage.removeItem('mymart_user');
        window.location.href = '/frontend/login.html';
    },

    isLoggedIn() {
        return !!localStorage.getItem('mymart_token');
    },

    getUser() {
        try {
            return JSON.parse(localStorage.getItem('mymart_user')) || null;
        } catch (e) {
            return null;
        }
    },

    getToken() {
        return localStorage.getItem('mymart_token');
    },

    // ── Orders ──
    async getOrders() {
        return await this.fetch('/orders');
    },

    async getOrderById(id) {
        return await this.fetch(`/orders/${id}`);
    },

    async createOrder(orderData) {
        return await this.fetch('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }
};

window.api = api;
