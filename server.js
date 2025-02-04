const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json'); // ใส่ไฟล์ Firebase Service Account
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware: ตรวจสอบ Token และดึงข้อมูลผู้ใช้
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization; // รับ Token จาก Header
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // เก็บข้อมูลผู้ใช้
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// ✅ API: ดึงข้อมูลผู้ใช้
app.get('/user', verifyToken, (req, res) => {
    res.json({
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || 'Guest'
    });
});

// ✅ รันเซิร์ฟเวอร์
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
