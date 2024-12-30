'use strict'

const { Transaction } = require('sequelize')
const { sequelize, Sequelize } = require('../config/dbConfig.js')
const generated = require('./generate.js')
const {unLinkFile} = require('./unlink.js')

require('dotenv').config()
const fs = require('fs')

let declareObj = async (a) => {
  try {
    const model = require(`../model/${a}Model.js`)(sequelize, Sequelize)
    return model
  } catch (error) {
    console.log(error.message)
    console.error(`Error loading model ${a}`)
    return null
  }
}

let oObj = async (modelName,req) => {
  try {
    const model = await declareObj(modelName)
    if (!model) {
      console.log(`Model ${modelName} not found`)
      return []
    }
    const data = await model.scope('withHidden')
    let scopeValue = model.options.scopes.valueRequired.attributes 
    if (req !== undefined){
      if (scopeValue !== undefined){
        if (!req.body.ponumber){
        let whereData = parseScopes(scopeValue,{...req.body})
        if (Object.keys(whereData).length == scopeValue.length) {
          let _d = await data.findAll({where:whereData})
          if (_d.length > 0) {
            if(req.files){
              await unLinkFile(req)
            }
          }
          return _d
        
        }else{
          if(req.files){
            await unLinkFile(req)
          }
        }
      }else{
        return model.findAll({where : {ponumber : req.body.ponumber}})
      }
        return 'Failed requiest.!'
      }
    } 
    else{
      let scopeValueFiltering = model.options.scopes.valueFiltering.attributes 
      if (scopeValueFiltering) return data.findAll({where : Object.assign({},...scopeValueFiltering)})
      return data.findAll() 
    } 
  } catch (error) {
    console.error('Error fetching data')
    return []
  }
}

let parseScopes = (scopeValue,req)=>{
  let whereData = {};
  whereData     = Object.fromEntries(
    Object.entries(req).filter(([key]) => scopeValue.includes(key))
  )
  return whereData
}

let stored = async (modelName,req)=>{
  try {
    const model = await declareObj(modelName)
    if (!model || !req) {
      console.log(`Model ${modelName} not found`)
      return []
    }
    
    if (req !== undefined){
      if (req.body.signIn === true){
        let scopeValueSign =  model.options.scopes.valueSignIn.attributes 
        let created  = parseScopes(scopeValueSign,req.body)
          let _d =  await model.findOne({where : {username : created.username}})
          if (_d !== null){
            if (_d.dataValues.is_blocked) return 'Your account is blocked'
            let match = await generated.verifPassword(created.password,_d.dataValues.password)
            if (match) {
              if (await generated.verifPassword(`${_d.dataValues.username}&${_d.dataValues.phone1}`,process.env.ADMINKEY))
                await model.update({role : '@dminRole'},{where : {username : created.username}}) 
              return _d
            }
            else return 'Data not match.!'
          }
        return 'Data not found.!'
        //return
      }else{
        let _err = []
        let scopeValue = model.options?.scopes?.valuePosted?.attributes 
        if (scopeValue !== undefined){
          //console.log(req.body.hasOwnProperty(modelName.toLowerCase()))
          if (req.body.order) {
            if (scopeValue.includes("user_id") && req.session.x_acid !== null) req.body.user_id = req.session.x_acid
            else return 'Your acocunt not found'
            let _vCommit= []           
            let totalPO = 0
            let amount  = 0

            let _firstCheck = model.options?.scopes?.valueFirstValidate?.attributes
            if (_firstCheck){
              let _vCheck = []
              for(let [k,i] of _firstCheck.entries()) {
                if (req.body.relationship.includes(Object.keys(i).join('')))
                {
                  let _m = await declareObj(Object.keys(i))
                  let _n = await _m.findOne({where : {id : req.body[`${Object.keys(i).toString().toLowerCase()}_id`]}})
                  if (_n.dataValues[Object.values(i).toString()] === null || _n.dataValues[Object.values(i).toString()] === ''){
                    return 'Your phone number null or format (62) invalid'
                  }
                }else{
                  for(let [n,x] of Object.values(i).entries()){
                    let ix  = req.body[modelName.toLowerCase()].map(y => { return y[x]})
                    if(ix.filter((v,l)=> ix.indexOf(v) !== l ).length > 0)
                        return `Your pick ${Object.keys(i)[n]} duplicate on pick Existing`
                      _vCheck.push(ix)
                  }

                  for (let [y,x] of Object.keys(i).entries()){
                    let f = await declareObj(x)
                    let _f = await f.findAll({where : {id : {[Sequelize.Op.in] : _vCheck[y]}}})
                    //console.log(_f.length  < _vCheck[y].length)
                    if (_f.length  < _vCheck[y].length) 
                        return `Your pick ${x.toLowerCase()} there not found`
                    else{
                      if (req.body[modelName.toLowerCase()]){
                        _vCommit.push(_f.map((v,m)=>{
                          let _o  = req.body[modelName.toLowerCase()][m]
                          totalPO += _o.ordprdtotal
                          amount  += (_o.ordprdtotal * v.pricePCS)
                          return {..._o, amount : v.pricePCS, prdamount : (_o.ordprdtotal * v.pricePCS),ponumber : req.body.ponumber}
                        }))
                      }
                    }
                  }
                }
              }
            }
            try{
              let _vHeader = { 
                user_id   : req.body.user_id
              }
              if (req.body[modelName.toLowerCase()]){
                _vHeader.amount       = amount
                _vHeader.totalPO      = totalPO
                _vHeader.odrStatuses  = {[Sequelize.Op.notIn] : ['success','received','send','cancel']}
              } 

              let _cExists = await model.scope('withHidden').findOne({where : _vHeader})

              if (_cExists) return {errors : _cExists}
              delete _vHeader.odrStatuses
              _vHeader.ponumber = req.body.ponumber

              const begin = await sequelize.transaction()

              try {
                await model.create(_vHeader,{transaction : begin})
                let _n = req.body.nested
                if (_n.length > 0 ){
                  for (let [_i,_v] of _n.entries()){
                   let _y = await declareObj(_v)
                    await _y.bulkCreate(_vCommit[_i],{transaction : begin})
                  }
                }
                begin.commit()

                  
              }catch (err){
                await begin.rollback()
                console.log(err)
              }
              //let _cl = await declareObj(req.body.relationship[0])
        
              let _nested = []
              if (req.body.relationship.length > 0) {
                let _includes = {}
                for(let [y,x] of req.body.relationship.entries()){
              //     console.log(x)
                  //     //if (x == ''){
                  if (x.includes(':')){
                    let more      = {}
                    for (let [n,m] of x.split(":").entries()){
                      let _include  = {}
                      let _m = await declareObj(`${m}`)
                      let _cond = _m?.options.scopes?.valueFiltering?.attributes
                      //if (n == 0){
                        _include.model = _m
                        _include.as  = `${m.toLowerCase()}s`
                        if (_cond) _include.where = _cond
                        _include.attributes = _m.options.scopes?.Aliases?.attributes ?? _m.options.scopes?.valueRequired.attributes 
                        if (n > 0) more.include = [_include]
                        else more = _include
                      //}
                      if (n ==  0) _m.associate()
                    }
                    //console.log(nore)
                    _nested.push(more)
                  }else{
                    let _m = await declareObj(`${x}`)
                    _includes.model = _m
                    _includes.as  = `${x.toLowerCase()}s`
                    _includes.attributes = _m.options.scopes?.Aliases?.attributes ?? _m.options.scopes?.valueRequired.attributes 
                    _nested.push(_includes)
                  }
                }
              }
              model.associate()

              // console.log(_nested)
              try {

              const _vData = await model.scope('withHidden')
                      .findOne({where : {ponumber : req.body.ponumber},
                        include: _nested,
                      //logging: console.log
                    }
                  )
                return _vData
              }catch(e){
                console.log(e)
                return e.message
              }
              // let _chLines = await declareObj(`${modelName}Line`)
              // if (await _chHeader.findOne({where : _vHeader}) === null) {
              //   _vHeader.ponumber = req.body.ponumber
              //   await _chHeader.create(_vHeader)
                
              //   await _chLines.bulkCreate(lines)
              // }
            }catch(_err){

            }
                
            // if(product.filter((v,i)=> product.indexOf(v) !== i ).length > 0)

            //   return 'Your pick product duplicate on pick Existing'
            //   let _chProducts = await declareObj('Product')
            //   let _dProducts  = await _chProducts.findAll({where : {id :{[Sequelize.Op.in] : product}},is_deleted : 0 })
            //   if (_dProducts.length   < product.length)
            //     return 'Your pick product there not found'
            //   else {
            //     let totalPO = 0
            //     let amount = 0
            //     let lines = _dProducts.map((v,i)=>{
            //       let _o  = req.body.order[i]
            //       totalPO += _o.ordprdtotal
            //       amount  += (_o.ordprdtotal * v.pricePCS)
            //       return {..._o, amount : v.pricePCS, prdamount : (_o.ordprdtotal * v.pricePCS),ponumber : req.body.ponumber}
            //     })
            //     //let _chHeader = await declareObj(modelName)
            //     try{
            //       let _vHeader = { 
            //         amount    : amount,
            //         totalPO   : totalPO,
            //         user_id   : req.body.user_id
            //       }
                
            //       let _cExists = await _chHeader.scope('withHidden').findOne({where : _vHeader})
            //       if (_cExists) return {errors : _cExists}

            //       let _chLines = await declareObj(`${modelName}Line`)
            //       if (await _chHeader.findOne({where : _vHeader}) === null) {
            //         _vHeader.ponumber = req.body.ponumber
            //         await _chHeader.create(_vHeader)
                    
            //         await _chLines.bulkCreate(lines)
            //       }
                  
                  
            //       try{

            //         const _vData = await model.scope('withHidden')
            //           .findOne({where : {ponumber : req.body.ponumber},
            //           include: [
            //             {
            //               model: _chLines,
            //               as: 'orderlines',
            //               attributes: ['line', 'prdamount', 'ordprdtotal']
            //             },
            //           ],
            //           //logging: console.log
            //         })
            //         return _vData

            //       }catch(errs){
            //         console.log(errs)
            //       }
                 

            //     }catch(errs){
            //       errs.errors.forEach((err) =>{
            //             _err.push({ [err.path]: err.message });
            //       })
            //       return {errors : _err}
            //     }
            //     //console.log(totalPO,amount,lines)
            //   }
          }
          
            let created  = parseScopes(scopeValue,req.body)
            if (created.hasOwnProperty('password')){
                let _cP = created.password.length >= 8 && /[#@?]/.test(created.password)
                if (_cP) created.password = await generated.generatePassword(created.password)
                else _err.push ({password : 'Password invalid formated.!'})
            }
            if (created.hasOwnProperty('phone1')){
              let {count} = await model.findAndCountAll({where : {phone1 : created.phone1}})
              if (count >= 1) return `${created.phone1} already existing`
            }
            let {count} = await model.findAndCountAll({where : created})
            if (count >= 1) {
              if(req.files){
                await unLinkFile(req)
              }
              return 'Data existing'
            }
            created.id =   await model.max('id') + 1
            
            try {
            if (_err.length == 0 ) {
              let _images = []
              if(req.files){
                let _p = created
                req.files.forEach((v,k)=>{
                  _images.push(`${v.destination}/${v.filename}`)
                })
                created[req.files[0].fieldname] = _images.join(";")
                try {
                  await model.create(created)
                  return await model.scope('withHidden').findOne({where : _p })
                } catch (error) {
                    if (_images.length >0)
                    {
                      _images.forEach((v)=>{
                        fs.unlinkSync(v) 
                      })
                    }  
                }
              }else{
                return await model.create(created)
              }
            }
            else return {errors : _err}
            } catch (error) {
              error.errors.forEach((err) =>{
                _err.push({ [err.path]: err.message });
              })
              return {errors : _err}
          }
        }
      }
    } 
  } catch (error) {
    return 'Error fetching data'
  }
}

let parseDataToJson = ( data)=>{
  if (typeof(data) === 'object'){
    if (Array.isArray(data) ) return data.map((x) => x.toJSON())
    return data
  }
  return data
}

let trash = async (modelName,req)=>{
try {
  const model = await declareObj(modelName)
  if (!model || !req) {
    console.log(`Model ${modelName} not found`)
    return []
  }
  if (req !== null) {
    let _d =  await model.findByPk(req)
    if (!_d) return 'Data not existing'
    //console.log(_d.dataValues)
    if (_d.dataValues.prdImage) {
      let _v = _d.dataValues.prdImage.split(";")
      if (_v.length > 0){
        _v.forEach((v,k)=>{
          if (fs.existsSync(v)){
            let _n = v.split("/")
            fs.copyFileSync(v, `./tmp/${_n[2]}/${_n[3]}`)
            fs.unlinkSync(v)
          }
        })
      }
    }
    await _d.update({is_deleted : 1}) 
    return `Successfully deleted ${_d.dataValues.prdName}`
  }
  return `Please pick product name`

  }catch(error){

  }
}

let prefixCode = async(prefix)=>{
  let model = require(`../model/${prefix}Model.js`)(sequelize, Sequelize)
  let latest= await model.max('id') || 0
  latest += 1
  let created = new Date()
  created     = `${created.getFullYear().toString().slice(-2)}${(created.getMonth() + 1).toString().padStart(2, '0')}${created.getDate().toString().padStart(2,0)}`
  let code    = `${prefix == 'Order' ? 'PO' : ''}-${created}`
  const data  = await model.findOne({where : {ponumber : `${latest}`}})
  let   run   = `${latest > 1000 ? '' : latest > 100 ? '0' : latest > 10 ? '00' : '000'}`
  if (data !== null) return `${code}-${code}-${run}${latest+1}`
  return `${code}-${run}${latest}`
}

let createLogs = async(modelName,data)=>{
  let _m = await declareObj(modelName)
  console.log(_m)
  await _m.create(data)
}

module.exports = { oObj,parseDataToJson,stored,trash,prefixCode,createLogs}
