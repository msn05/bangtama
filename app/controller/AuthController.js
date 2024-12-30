'use strict'

const jwt = require('jsonwebtoken')

const { oObj,parseDataToJson,stored } = require('../helper/funcTable.js');
const { responseData } = require('../helper/response.js');
const {signApp} = require('../helper/jwt.js');

const User = require('../model/UserModel.js');

exports.signIn = async (req,res)=>{
  req.body.signIn = true
  const data =  await stored('User',req)
  if (typeof(data) === 'string')
    return res.json(responseData(data,null))
  else{
    req.body.id    = data.dataValues.id
    req.body.role  = data.dataValues.role
    await signApp(req)
    req.body.token = req.session.token
    delete req.body.password
    delete req.body.role
    
    return  res.json(responseData(parseDataToJson(req.body),null))
  }
}

exports.signOut = async (req,res)=>{
  try {
    if (req.session.token) {
      req.session = null;
      return res.status(200).send({
        message: "Succcesfully sign out"
      })
    }else{
      return res.json(responseData('Data Existing',null))
    }
  } catch (err) {

  }
}


exports.getData = async (req,res) => {
  //if (req.session.role !== '@dminRole') return res.json(responseData('Forbidden Access',{errors : {page : req.protocol + "://" + req.get('host') + req.originalUrl}}))
  try {
    const data =  await oObj('User')
     res.json(responseData(parseDataToJson(data),null))
  } catch (error) {
    console.error('Error in controller:', error.message);
     res.json([]);
  }
  return
}

exports.createData = async (req,res, next)=>{
  let p = req.body

  if (p !== null){
    const data = await oObj('User',req)
    if (typeof (data) === 'object')
    {
      if (data.length >= 1) res.json(responseData('Data Existing',parseDataToJson(data)))
      else{
        const store =  await stored('User',req)
        res.json( responseData(parseDataToJson(store),null))
      }
      return
    }
    return res.json(responseData(parseDataToJson(data),null))
  }
}

