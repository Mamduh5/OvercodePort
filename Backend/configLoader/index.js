
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load .env
const { replaceEnvVars } = require('./envResolver');

// Determine environment (default = development)
const NODE_ENV = process.env.NODE_ENV || 'development';

// Build config file path
const configPath = path.join(__dirname, '..', 'config', `${NODE_ENV}.json`);

// Check file exists
if (!fs.existsSync(configPath)) {
  throw new Error(`Config file not found for environment: ${NODE_ENV}`);
}

// Load raw config
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Replace env variables
const resolvedConfig = replaceEnvVars(rawConfig);

// Export final config
module.exports = resolvedConfig;
