// Basic Express server setup - placeholder for now
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT) || 3001;

// Function to find available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Investment Management Portal API is running' });
});

// API Routes
const projectsRouter = require('./routes/projects');
const companyProfileRouter = require('./routes/company-profile');
const investorPortalRouter = require('./routes/investor-portal');
const debtEquityClassesRouter = require('./routes/debt-equity-classes');
const customUnitClassesRouter = require('./routes/custom-unit-classes');
const dealRoomRouter = require('./routes/deal-room');
const imagesRouter = require('./routes/images');
const contactsRouter = require('./routes/contacts');
const documentsRouter = require('./routes/documents');

app.use('/api/projects', projectsRouter);
app.use('/api/company-profile', companyProfileRouter);
app.use('/api/investor-portal', investorPortalRouter);
app.use('/api/debt-equity-classes', debtEquityClassesRouter);
app.use('/api/custom-unit-classes', customUnitClassesRouter);
app.use('/api', dealRoomRouter);
app.use('/api/images', imagesRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/documents', documentsRouter);

// Start server with automatic port finding
findAvailablePort(PORT).then((availablePort) => {
  app.listen(availablePort, () => {
    console.log(`Server running on port ${availablePort}`);
    console.log(`Health check: http://localhost:${availablePort}/health`);
    console.log(`Projects API: http://localhost:${availablePort}/api/projects`);
    console.log(`Investor Portal API: http://localhost:${availablePort}/api/investor-portal`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;