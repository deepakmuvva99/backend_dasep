require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Require DB configuration to establish connection on startup
require('./config/database');
const { errorHandler } = require('./middlewares/errorMiddleware');
const v1Router = require('./routes/v1');
const cronService = require('./services/cronService');

const app = express();

app.use(cors());
app.use(express.json());

// Main App Routes
app.use('/api/v1', v1Router);

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is up and connected' });
});

// Only explicitly serve Swagger documentation if outside of production
if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./swagger_output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Centralized error handler logic attached at the end of routing
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    cronService.start();
});
