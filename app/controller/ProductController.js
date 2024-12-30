'use strict'

const { oObj,parseDataToJson,stored,trash } = require('../helper/funcTable.js')
const { responseData } = require('../helper/response.js')


exports.store = async (req,res)=>{
  if (req !== null){
    const data = await oObj('Product',req)
    if (typeof (data) === 'object')
    {
      if (data.length >= 1) res.json(responseData('Data Existing',parseDataToJson(data)))
      else{
        const store =  await stored('Product',req)
        res.json( responseData(parseDataToJson(store),null))
      }
      return
    }
    return res.json(responseData(parseDataToJson(data),null))
  }
}

exports.getData = async (req, res)=>{
  try {
    const data =  await oObj('Product')
     res.json(responseData(parseDataToJson(data),null))
  } catch (error) {
    console.error('Error in controller:', error.message);
     res.json([]);
  }
  return
}

exports.trash = async (req, res)=>{
  try {
    const data =  await trash('Product',req.params.id)
    res.json(responseData(parseDataToJson(data),null))
  } catch (error) {
    console.error('Error in controller:', error.message);
     res.json([]);
  }
  return
}