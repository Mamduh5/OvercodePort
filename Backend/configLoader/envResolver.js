// configLoader/envResolver.js
  
  function replaceEnvVars(obj) {
    if (typeof obj === 'string') {
      return obj.replace(/\$\{\{(\w+)\}\}/g, (_, name) => process.env[name] || '');
    } else if (Array.isArray(obj)) {
      return obj.map(replaceEnvVars);
    } else if (obj && typeof obj === 'object') {
      const resolved = {};
      for (const key in obj) {
        resolved[key] = replaceEnvVars(obj[key]);
      }
      return resolved;
    }
    return obj;
  }
  
  module.exports = {
    replaceEnvVars,
  };