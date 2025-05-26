const fs = require('fs')
const fileType = require('file-type')
const config = require('config')
const { responseFormat, responseFormatValidate } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js')
const configFilterImages = config.get('_filterFile').image_type

const uploadImageValidate =
  (Language = 'EN') =>
    async (ctx, next) => {
      try {
        const language = ctx.language ? ctx.language : Language
        const files = ctx.request.files
        const { upload } = files || {}
        ctx.hasImage = false
        if (!files) {
          ctx.body = responseFormat({ form_data: 'upload' }, 'MISSING_REQUIRED_FILES', language)
          return;
        }
        if (!Object.keys(files).length) {
          ctx.body = responseFormat({ form_data: 'upload' }, 'MISSING_REQUIRED_FILES', language)
          return;
        }
        if (!upload) {
          ctx.body = responseFormat({ form_data: 'upload' }, 'MISSING_REQUIRED_FILES', language)
          return;
        }
        const {
          upload: { newFilename: name, originalFilename, mimetype: type, _writeStream: writeStream }
        } = files || {}
        const { path } = writeStream || {}

        let errors = await ctx.validationErrors()
        if (errors) {
          ctx.body = responseFormatValidate(errors)
          return;
        }
        const readFile = fs.readFileSync(path)
        if (!readFile.length) {
          ctx.body = responseFormat(language, 'MISSING_REQUIRED_FILES', { form_data: 'id_image_front' })
          return;
        }
        const getExt = await fileType.fromBuffer(readFile)
        if (!getExt) {
          ctx.body = responseFormat(language, 'FILE_EXTENSION_NOT_ALLOW')
          return;
        }
        const { ext } = getExt
        const extFilter = configFilterImages.filter(v => v === ext)
        if (!extFilter.length) {
          ctx.body = responseFormat(language, 'FILE_EXTENSION_NOT_ALLOW')
          return;
        }
        ctx.hasImage = { orin: originalFilename, name, path, type }
        return next()
      } catch (error) {
        throw throwError(error, 'uploadImageValidate')
      }
    }


module.exports = { uploadImageValidate }
