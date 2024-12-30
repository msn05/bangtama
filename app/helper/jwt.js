'use strict'

require('dotenv').config()
const jwt = require('jsonwebtoken')
const { adminId } = require('../helper/whatshapp.js')

exports.verif = async (req,res,next,token)=>{

  try{

    jwt.verify(token,process.env.SECRET,
      (_err,decoded)=>{
        if (_err)  res.status(300).send({
          statusCode : 3000,
          message: "Your token expired.!"
        })
        req.account = decoded.id
      }
    )
  }catch{
    res.status(401).send({ 
      statusCode: 401, 
      responseCode: "Invalid token." 
    })
    return
  }
    
}

exports.signApp =  async (req)=>{

  try {
    
    let token = jwt.sign({
      username : req.body.username
    },
    process.env.SECRET,
    {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: 3000,
    })
    req.session.token       = token
    req.session.role        = req.body.role
    req.session.x_acid      = req.body.id

    if (req.body.role === '@dminRole') {
      await adminId()
    }

  } catch (error) {
    
  }
}