var axios = require('axios')
const { encode_without_async } = require('../libs/base64.js')

// === HOW TO USE ====
// === require ====
// const microservice_uni_level = config.get('microservice_uni_level')
// const platform = ctx.request.headers['x-platform']
// === PARAMS ====
// email && name && lastname && phone
//   const objCallUniLevel = { partnerId: partnerId.toString(), referenceId, refLink, Role }
//   const jwt = encodeJWTDynamic(objCallUniLevel, microservice_uni_level['hash'], microservice_uni_level['options'])
//   postUniLevelService(microservice_uni_level['url'], '/unilevel/info', microservice_uni_level['basicAuth'], platform, jwt, JSON.stringify({ name, lastname, email, phone }))

const getUniLevelService = async (url, path, basicKey, xPlatform, token) => {
  const { username: basicUser, password: basicPass } = basicKey || {}
  const basicAuth = encode_without_async(basicUser + ':' + basicPass)
  return new Promise((resolve, reject) => {
    const config = {
      method: 'get',
      url: url + path,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'x-access-token': token,
        'x-platform': xPlatform,
        'accept-language': 'EN'
      }
    }
    axios(config)
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

const postUniLevelService = async (url, path, basicKey, xPlatform, token, data) => {
  const { username: basicUser, password: basicPass } = basicKey || {}
  const basicAuth = encode_without_async(basicUser + ':' + basicPass)
  return new Promise((resolve, reject) => {
    const config = {
      method: 'post',
      url: url + path,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'x-access-token': token,
        'x-platform': xPlatform,
        'accept-language': 'EN'
      },
      data: data
    }
    axios(config)
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

const putUniLevelService = async (url, path, basicKey, xPlatform, token, data) => {
  const { username: basicUser, password: basicPass } = basicKey || {}
  const basicAuth = encode_without_async(basicUser + ':' + basicPass)
  return new Promise((resolve, reject) => {
    const config = {
      method: 'put',
      url: url + path,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'x-access-token': token,
        'x-platform': xPlatform,
        'accept-language': 'EN'
      },
      data: data
    }
    axios(config)
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

module.exports = { getUniLevelService, postUniLevelService, putUniLevelService }
