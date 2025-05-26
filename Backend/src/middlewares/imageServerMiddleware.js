const { throwError } = require('../libs/errorService.js')
const { uploadFileToServer, downloadFileAsBufferFromServer } = require('../callservices/ImageServer.js')

const uploadImageService =
  () =>
    async (ctx, next) => {
      try {
        if (ctx.hasImage !== false) {
          ctx.hasImage.map(file => { return uploadFileToServer(file.path, `${ctx.user_id}`, `${ctx.user_id}/${file.name}.jpg`); });
        }
        return next()
      } catch (error) {
        throw throwError(error, 'uploadImageService')
      }
    }

    const viewImageService =
    () =>
      async (ctx, next) => {
        let getData;
        try {
          if(ctx.resposeValue.images.length > 0){
            const getPromises = ctx.resposeValue.images.map(async (file) => {
              const bufferData = await  downloadFileAsBufferFromServer(`${file['image_user_id']}/${file['image_name']}.jpg`); 
              return {
                base64: bufferData.toString('base64'), 
                image_id:file['image_id'],
                image_user_id:file['image_user_id'],
                image_name:file['image_name']
              }
            })
            getData = await Promise.all(getPromises);
          }
          ctx.resposeValue.images = getData || []
          return next()
        } catch (error) {
          throw throwError(error, 'viewImageService')
        }
      }







module.exports = { uploadImageService, viewImageService }
