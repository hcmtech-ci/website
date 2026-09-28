const express = require('express');
const path = require('path');
const app = express();

// Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend Static Files (HTML, CSS, JS, Images) များကို Serve လုပ်ရန်
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. FRONTEND ROUTES (HTML စာမျက်နှာများ ပြသရန်)
// ==========================================

// Main Website (Homepage)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_panel.html'));
});

// ==========================================
// 2. BACKEND API ROUTES (စစ်ဆေးရေးနှင့် Proxy Logic)
// ==========================================

app.post('/api/check-user', async (req, res) => {
    try {
        // လူကြီးမင်းရေးထားသော Proxy / Client Data စစ်ဆေးသည့် Logic များကို ဒီနေရာတွင် ထည့်ပါ
        // Example Response:
        /*
        if (foundClient) {
            return res.json({ success: true, data: foundClient });
        } else {
            return res.json({ success: false, message: 'အကောင့် မတွေ့ရှိပါ' });
        }
        */
        res.json({ success: true, message: 'API Connected' });
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server အပိုင်းတွင် မထင်မှတ်ဘဲ အမှားဖြစ်ပွားပါသည်: ' + error.message 
        });
    }
});

// ==========================================
// 3. SERVER PORT SETUP
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
