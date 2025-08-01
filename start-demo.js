#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

// Function to find an available port
function findAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
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
}

async function startDemo() {
  try {
    console.log('🚀 Starting Investment Management Portal Demo...\n');
    
    // Find available ports
    const backendPort = await findAvailablePort(3001);
    const frontendPort = await findAvailablePort(3000);
    
    console.log(`📡 Backend will run on: http://localhost:${backendPort}`);
    console.log(`🌐 Frontend will run on: http://localhost:${frontendPort}\n`);
    
    // Update client proxy to point to the backend port
    const fs = require('fs');
    const clientPackagePath = './client/package.json';
    const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));
    clientPackage.proxy = `http://localhost:${backendPort}`;
    fs.writeFileSync(clientPackagePath, JSON.stringify(clientPackage, null, 2));
    
    // Start backend
    const backend = spawn('node', ['run-server.js'], {
      env: { ...process.env, PORT: backendPort },
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    backend.stdout.on('data', (data) => {
      console.log(`[BACKEND] ${data.toString().trim()}`);
    });
    
    backend.stderr.on('data', (data) => {
      console.log(`[BACKEND] ${data.toString().trim()}`);
    });
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start frontend
    const frontend = spawn('npm', ['start'], {
      cwd: './client',
      env: { ...process.env, PORT: frontendPort, BROWSER: 'none' },
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    frontend.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output.includes('webpack compiled')) {
        console.log(`\n✅ Demo Ready!`);
        console.log(`🌐 Open your browser to: http://localhost:${frontendPort}`);
        console.log(`📡 API available at: http://localhost:${backendPort}/health\n`);
      }
      console.log(`[FRONTEND] ${output}`);
    });
    
    frontend.stderr.on('data', (data) => {
      console.log(`[FRONTEND] ${data.toString().trim()}`);
    });
    
    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down demo...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start demo:', error);
    process.exit(1);
  }
}

startDemo();