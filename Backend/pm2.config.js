module.exports = {
  apps: [
    {
      name: 'base3-koajs-mongo-setup-cluster',
      script: 'npm',
      args: 'start',
      instances: 'max',
      watch: true,
      ignore_watch: ['package-lock.json', 'node_modules', 'logs', '.DS_Store', 'newrelic_agent.log'],
      max_restarts: 3,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
