'use strict'

exports.responseData = (x,y)=>{
  let _300 = ['not found','Existing','Forbidden Access','blocked','invalid']
  let statusCode = 200
  let responseCode = 'Successfully'
  let data =  (y !== null ? y : x)

  if (typeof (x) !== 'object') 
  {
    statusCode = (_300.some(item => x.includes(item)) ? 300 : statusCode)
    responseCode = (_300.some(item => x.includes(item)) ? x : 'Failed fetching data.!')
  }
  else {
    if (x.hasOwnProperty("errors")){ 
      statusCode = 300
      responseCode = 'Failed'
    }
  }
  let _r =  {
    statusCode,
    responseCode,
    data
  }
  //if (_r.statusCode <= 204) _r = {..._r, data : data}
  return _r
}