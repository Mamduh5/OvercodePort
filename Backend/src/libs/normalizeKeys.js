const normalizeKeys = async obj => {
  let newObj = {}

  for (let key in obj) {
    let newKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
    newObj[newKey] = obj[key]
  }

  return newObj
}

const keysInNormalizeKeys = async obj => {
  const allKeys = await normalizeKeys(obj)
  return Object.keys(allKeys)
}

module.exports = { normalizeKeys, keysInNormalizeKeys }
