const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Static HTML Files သို့ ဦးတည်ခြင်း
app.use(express.static(path.join(__dirname, 'public')));

// 3X-UI login and fetch client stats
app.post('/api/check-client', async (req, res) => {
    const { serverUrl, subpath, username, password, email } = req.body;

    if (!serverUrl || !email) {
        return res.status(400).json({ success: false, message: 'Server URL နှင့် Email လိုအပ်ပါသည်။' });
    }

    try {
        const cleanSubpath = subpath ? (subpath.startsWith('/') ? subpath : '/' + subpath) : '';
        const baseUrl = serverUrl.replace(/\/$/, '') + cleanSubpath;

        const axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 10000,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        let cookieHeader = '';

        // Panel Username/Password ရှိလျှင် Login အရင်ဝင်မည်
        if (username && password) {
            const loginParams = new URLSearchParams();
            loginParams.append('username', username);
            loginParams.append('password', password);

            const loginRes = await axiosInstance.post('/login', loginParams);
            const cookies = loginRes.headers['set-cookie'];
            if (cookies) {
                cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
            }
        }

        // Fetch Inbound list
        const listRes = await axiosInstance.get('/panel/api/inbounds/list', {
            headers: { 'Cookie': cookieHeader }
        });

        if (!listRes.data || !listRes.data.success) {
            return res.json({ success: false, message: 'Panel API ယူ၍ မရပါ။' });
        }

        let foundClient = null;

        for (let inbound of listRes.data.obj) {
            const settings = JSON.parse(inbound.settings || '{}');
            const clients = settings.clients || [];
            const clientStats = inbound.clientStats || [];

            const targetClient = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
            const targetStat = clientStats.find(c => c.email.toLowerCase() === email.toLowerCase());

            if (targetClient) {
                const up = targetStat ? targetStat.up : 0;
                const down = targetStat ? targetStat.down : 0;
                const totalUsed = up + down;
                const totalGB = targetClient.totalGB || 0;

                foundClient = {
                    email: targetClient.email,
                    usedGB: (totalUsed / (1024 * 1024 * 1024)).toFixed(2),
                    totalGB: totalGB > 0 ? (totalGB / (1024 * 1024 * 1024)).toFixed(2) : "Unlimited",
                    remainingGB: totalGB > 0 ? Math.max(0, (totalGB - totalUsed) / (1024 * 1024 * 1024)).toFixed(2) : "Unlimited",
                    expiry: targetClient.expiryTime > 0 ? new Date(targetClient.expiryTime).toLocaleDateString("my-MM") : "သက်တမ်းမကုန်ပါ",
                    enable: targetClient.enable
                };
                break;
            }
        }

        if (foundClient) {
            return res.json({ success: true, data: foundClient });
        } else {
            return res.json({ success: false, message: 'အကောင့် ရှာမတွေ့ပါ။' });
        }

    } catch (error) {
        console.error('Proxy Error:', error.message);
        return res.status(500).json({ success: false, message: 'Server ချိတ်ဆက်မှု မအောင်မြင်ပါ: ' + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
