'use strict'

const multer = require('multer')
const { responseData } = require('../helper/response.js')

const images = (req,file,callback)=>{
    let mimes = ['image/jpeg','image/png']
    if (mimes.includes(file.mimetype )){
      callback(null,true)
    }else{
      callback(new Error('Formated file not allowed.!'), false)
    }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/products')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const uploadFile = multer({ storage: storage,fileFilter : images, limits : {fileSize : 1000000  }})

exports.upload = (req,res,next)=>{
  return uploadFile.array('prdImage',3)(req,res, (err)=>{
    let _errLog = []
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        _errLog.push({ size: 'file size max 1mb' })
      }
    }
    if (err && !(err instanceof multer.MulterError)) {
      _errLog.push({mimetype : err.message})
    }
    if (_errLog.length > 0) return res.json(responseData('Forbidden Access', {errors : _errLog}))
      next()
    })
}

