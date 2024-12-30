'use strict'

const { oObj,parseDataToJson,stored,trash,prefixCode } = require('../helper/funcTable.js')
const { responseData } = require('../helper/response.js')
const { _wwebJSService } = require('../helper/whatshapp.js')


exports.store = async (req,res)=>{
  if (req.body !== null){
    req.body.ponumber = await prefixCode('Order')
    const data = await oObj('Order',req)
    if (data.length == 0) {
      req.body.relationship = ['User','OrderLine:Product']
      req.body.nested       = ['OrderLine']

      const store =  await stored('Order',req)
      // if (typeof store === "string")  res.json(responseData(store,null))
      if (typeof (store) === 'object')
      {
        if(store.hasOwnProperty('errors'))
        {
          return res.json(responseData('Data Existing',parseDataToJson(store)))
        }
        let _res = await _wwebJSService(store,'sendToAdmin')

        if (typeof (_res) === 'string') {
          return res.json(responseData(_res,null))
        }

        return res.json( responseData(parseDataToJson(store),null))
      }
      return res.json( responseData(store,req.body.order))

    }
    else if (typeof (data) === 'object')
    {
      //console.log(data)
      // if (data.length >= 1) res.json(responseData('Data Existing',parseDataToJson(data)))
      // else{
      //   const store =  await stored('Order',req)
        res.json( responseData(parseDataToJson(store),null))
      //}
      return
    }
    return res.json(responseData(parseDataToJson(data),null))
  }
}