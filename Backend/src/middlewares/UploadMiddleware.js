const { googleUploadImage, signedURLGoogleStorageSetTime } = require('../libs/googlestorage.js')
const { throwError } = require('../libs/errorService.js')
const otpGenerator = require('otp-generator')

const uploadImage =
  (type = 'profile') =>
  async (ctx, next) => {
    try {
      const { Username } = ctx.tokenDetails || {}
      const fileUpload = ctx.hasImage
      ctx.urlImages = null
      if (!fileUpload) return next()

      const url = await googleUploadImage(fileUpload, Username, type)
      ctx.urlImages = url
      return next()
    } catch (error) {
      throw throwError(error, 'uploadImage')
    }
  }

const uploadSecureImage =
  (type = 'profile') =>
  async (ctx, next) => {
    try {
      const { Username } = ctx.tokenDetails || {}
      const fileUpload = ctx.hasImage
      ctx.urlImages = null
      if (!fileUpload) return next()

      const url = await googleUploadImage(fileUpload, Username, type, false)
      ctx.urlImages = url
      return next()
    } catch (error) {
      throw throwError(error, 'uploadSecureImage')
    }
  }

const uploadSecureImageNoneAuth =
  (type = 'profile') =>
  async (ctx, next) => {
    try {
      const Username = otpGenerator.generate(20)
      const fileUpload = ctx.hasImage
      ctx.urlImages = null
      if (!fileUpload) return next()

      const url = await googleUploadImage(fileUpload, Username, type, false)
      ctx.urlImages = url
      return next()
    } catch (error) {
      throw throwError(error, 'uploadSecureImageNoneAuth')
    }
  }

const addSignedURLWithTimeOut = timeOut => async (ctx, next) => {
  try {
    const { url } = ctx.request.body || {}
    ctx.signedUrl = await signedURLGoogleStorageSetTime(url, timeOut)
    return next()
  } catch (error) {
    throw throwError(error, 'addSignedURLWithTimeOut')
  }
}

const adminUploadImage =
  (type = 'profile') =>
  async (ctx, next) => {
    try {
      const { AdminCode, AdminName } = ctx.tokenDetails || {}
      const fileUpload = ctx.hasImage
      ctx.urlImages = null
      if (!fileUpload) return next()

      const url = await googleUploadImage(fileUpload, `${AdminName}_${AdminCode}`, type)
      ctx.urlImages = url
      return next()
    } catch (error) {
      throw throwError(error, 'adminUploadImage')
    }
  }

module.exports = { uploadImage, uploadSecureImage, uploadSecureImageNoneAuth, addSignedURLWithTimeOut, adminUploadImage }
