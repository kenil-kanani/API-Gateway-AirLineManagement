const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();

const PORT = process.env.PORT || 3005;

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5
});

app.use(morgan('combined'));
app.use(limiter);
app.use('/bookingservice', async (req, res, next) => {
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
            headers: {
                "x-access-token": req.headers['x-access-token']
            }
        })
        if (response.data.success) {
            next();
        } else {
            res.status(401).json({ message: "Unauthorized" })
        }
    } catch (error) {
        console.log("Error : ", error);
        res.status(401).json({ message: "Unauthorized" })
    }
})

app.use('/flightandsearchservice', createProxyMiddleware({ target: 'http://localhost:3000/', changeOrigin: true }));
app.use('/authservice', createProxyMiddleware({ target: 'http://localhost:3001/', changeOrigin: true }));
app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002/', changeOrigin: true }));
app.use('/reminderservice', createProxyMiddleware({ target: 'http://localhost:3004/', changeOrigin: true }));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/home', (req, res) => {
    res.json({ "message": "Welcome to the home page" })
})