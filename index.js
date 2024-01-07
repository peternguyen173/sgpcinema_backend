const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
const cookieParser = require('cookie-parser');

const authRoutes = require('./Routes/Auth')
const adminRoutes = require('./Routes/Admin')
const movieRoutes = require('./Routes/Movie')
const imageuploadRoutes = require('./Routes/imageUploadRoutes');
const bannerRoutes = require('./Routes/Banner');

require('dotenv').config();
require('./db')



app.use(bodyParser.json());
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', "https://sgpcinema-admin.vercel.app", "https://sgpcinema.vercel.app", "https://sgpcinema-peters-projects-5fccdbc6.vercel.app"]; // Add more origins as needed
// Configure CORS with credentials
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow credentials
    })
);
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/movie', movieRoutes);
app.use('/image', imageuploadRoutes);
app.use('/banner', bannerRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'The API is working' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});