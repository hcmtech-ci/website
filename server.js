const express = require('express');
const path = require('path');
const axios = require('axios'); // 3X-UI API ချိတ်ဆက်ရန်အတွက်
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Admin Credentials
const ADMIN_EMAIL = 'hcmtech.mm@gmail.com';
const ADMIN_PASS = 'Hcmadminpanel@312021';

// In-memory or temporary storage for server configs (ဒီနေရာမှာ database သို့မဟုတ် json file နဲ့လည်း သိမ်းဆည်းနိုင်ပါတယ်)
let serverConfig = {
    freeServer: { url: '', username: '', password: '', subpath: '' },
    sgServer: { url: '', username: '', password: '', subpath: '' }
};

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

// Save Server Configurations from Admin Panel
app.post('/api/save-config', (req, res) => {
    const { type, url, username, password, subpath } = req.body;
    if (type === 'free') {
        serverConfig.freeServer = { url, username, password, subpath };
    } else if (type === 'sg') {
        serverConfig.sgServer = { url, username, password, subpath };
    }
    res.json({ success: true, message: 'Server Config သိမ်းဆည်းပြီးပါပြီ' });
});

// Free Key Generation (7 Days / 30 GB Limit)
app.post('/api/generate-free-key', async (req, res) => {
    try {
        const { email } = req.body;
        const expireDays = 7;
        const dataLimitGB = 30;
        const bytesLimit = dataLimitGB * 1024 * 1024 * 1024;
        const expireTime = Date.now() + (expireDays * 24 * 60 * 60 * 1000);

        // 3X-UI API သို့ ချိတ်ဆက်၍ Client အသစ်ဖန်တီးသည့် Logic 
        // (ဥပမာအနေဖြင့် အောက်ပါအတိုင်း Response ပြန်ပေးထားသည် - တကယ်ချိတ်လျှင် 3X-UI Login Session ယူပြီး Inbound ထဲသို့ Client add ရပါမည်)
        
        res.json({
            success: true,
            message: 'Free Key အောင်မြင်စွာ ထုတ်ယူပြီးပါပြီ',
            keyName: email || `FreeUser_${Math.floor(Math.random() * 1000)}`,
            vlessKey: `vless://free-key-${Math.random().toString(36.substring(7))}@server:443?encryption=none&security=tls#Free-30GB-7Days`,
            limitGB: '30 GB',
            expireDays: '7 ရက်'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error ဖြစ်ပွားနေပါသည်။' });
    }
});

// Check GB Status by Email or Key Name
app.post('/api/check-gb', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.json({ success: false, message: 'ကျေးဇူးပြု၍ Email သို့မဟုတ် Key Name ထည့်ပါ။' });
    }

    // 3X-UI ဆာဗာထဲမှ သက်ဆိုင်ရာ Email/Remark ဖြင့် Data များကို ရှာဖွေစစ်ဆေးမည့်နေရာ
    res.json({
        success: true,
        query: query,
        totalGB: '30.00 GB',
        usedGB: '2.50 GB',
        remainingGB: '27.50 GB',
        expiryDate: '7 ရက် (ကျန်ရှိ)'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
