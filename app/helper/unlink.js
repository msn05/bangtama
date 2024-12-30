'use strict'

const fs = require('fs')

exports.unLinkFile = async (req)=>{
    req.files.forEach((v)=>{
       fs.unlinkSync(`${v.destination}/${v.filename}`) 
    })
}