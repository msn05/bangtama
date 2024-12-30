'use strict'

const jwt = require('jsonwebtoken')

const { responseData } = require('../helper/response.js')
const { verif } = require('../helper/jwt.js')
const unautorized = ['/', '/product-store', '/trash-product']

exports.tokens = async (req, res, next) => {
  try {
    if (!req.session.token) {
      return res.status(300).send({
        statusCode: 300,
        responseCode: "Your token expired.!"
      })
    }

    await verif(req, res, next, req.session.token)

    if (
      req.session.role !== '@dminRole' &&
      unautorized.some(path => req.originalUrl === path)
    ) {
      //console.log(unautorized.some(path => req.originalUrl.startsWith(path)))
      return res.status(300).send({
        statusCode: 300,
        responseCode: 'Unauthorized'
      })
    }

    next()
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send({
        statusCode: 500,
        responseCode: "Internal server error"
      })
    }
  }
}
