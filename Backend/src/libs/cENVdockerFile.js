const fs = require('fs').promises
const path = require('path')
const env = process.env.NODE_ENV || 'development'


const createEnvFile = async () => {
  const jsonFilePath = path.join(__dirname, `../../config/${env.toLowerCase()}.json`)

  const data = await fs.readFile(jsonFilePath, 'utf8')
  const config = JSON.parse(data)

  let envContent = ''

  const serverName = 'SERVER'
  const dataKeyFilterServer = searchInObject(config, serverName.toLowerCase(), ['port'])
  for (const key in dataKeyFilterServer) {
    envContent += `${serverName}_${key.toUpperCase()}_ENV=${dataKeyFilterServer[key]}\n`
  }

  const mongoName = 'DATABASE'
  const dataKeyFilterMongo = searchInObject(config, mongoName.toLowerCase(), ['username', 'password'])
  for (const key in dataKeyFilterMongo) {
    envContent += `${mongoName}_${key.toUpperCase()}_ENV=${dataKeyFilterMongo[key]}\n`
  }

  envContent += `NODE_ENV=${env}\n`

  const envFilePath = path.join(__dirname, '../../.env')
  await fs.writeFile(envFilePath, envContent)

  return '.env file created successfully!'
}

function searchInObject(obj, targetKey, targetArray = []) {
  for (let key in obj) {
    if (key === targetKey) {
      if (targetArray.length > 0 && typeof obj[key] === 'object') {
        const filteredObj = Object.keys(obj[key])
          .filter(key => targetArray.includes(key))
          .reduce((newObj, key) => {
            return { ...newObj, [key]: obj[targetKey][key] }
          }, {})

        return filteredObj
      }

      return { [key]: obj[key] }
    } else if (typeof obj[key] === 'object') {
      let result = searchInObject(obj[key], targetKey, targetArray)

      if (result) {
        return result
      }
    }
  }

  return null
}

module.exports = { createEnvFile }
