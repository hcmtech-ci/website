const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Admin Credentials
const ADMIN_EMAIL = 'hcmtech.mm@gmail.com';
const ADMIN_PASS = 'Hcmadminpanel@312021';

// Database simulation for 3X-UI Panels and Configs
let panelsList = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Hidden Admin Panel Route (No link from main website)
app.get('/hcm-secure-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_panel.html'));
});

// Admin Login API
app.post('/api/admin-login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.json({ success: true, message: 'Login အောင်မြင်ပါသည်' });
    } else {
        return res.json({ success: false, message: 'Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။' });
    }
});

// Save or Add 3X-UI Panel
app.post('/api/save-panel', (req, res) => {
    const { panelName, url, username, password, subpath } = req.body;
    panelsList.push({ panelName, url, username, password, subpath, status: 'Online' });
    res.json({ success: true, message: '3X-UI Panel အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ', panels: panelsList });
});

// Get Panels List
app.get('/api/panels', (req, res) => {
    res.json({ success: true, panels: panelsList });
});

// Free Key Generation (7 Days / 30 GB Limit)
app.post('/api/generate-free-key', async (req, res) => {
    const { email } = req.body;
    res.json({
        success: true,
        keyName: email || `FreeUser_${Math.floor(Math.random() * 1000)}`,
        vlessKey: `vless://free-key-${Math.random().toString(36).substring(7)}@server:443?encryption=none&security=tls#Free-30GB-7Days`,
        subscriptionUrl: `https://hcmteam.com/sub/free-${Math.random().toString(36).substring(7)}`,
        limitGB: '30 GB',
        expireDays: '7 ရက်'
    });
});

// Check GB Status by Email or Key Name
app.post('/api/check-gb', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.json({ success: false, message: 'ကျေးဇူးပြု၍ Email သို့မဟုတ် Key Name ထည့်ပါ။' });
    }

    res.json({
        success: true,
        query: query,
        totalGB: '30.00 GB',
        usedGB: '2.50 GB',
        remainingGB: '27.50 GB',
        expiryDate: 'ကျန်ရှိရက် - ၆ ရက်'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
