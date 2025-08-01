// Register TypeScript for .ts files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
    esModuleInterop: true
  }
});

// Start the server
require('./src/routes/index.js');