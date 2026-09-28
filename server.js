const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Frontend Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_panel.html'));
});

// Admin Login API Route
app.post('/api/admin-login', (req, res) => {
    const { email, password } = req.body;

    const ADMIN_EMAIL = 'hcmtech.mm@gmail.com';
    const ADMIN_PASS = 'Hcmadminpanel@312021';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.json({ success: true, message: 'Login အောင်မြင်ပါသည်' });
    } else {
        return res.json({ success: false, message: 'Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
