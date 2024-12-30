let mysql = require('mysql2')
let {Sequelize} = require('sequelize')

let configDefaultDB  = {
  port    : 3306,
  user    : 'root',
  password: ''
}


/* first test connection */
let checkConnection = mysql.createPool({
  connectionLimit: 10,
  host    : 'localhost',
  ...configDefaultDB,
  waitForConnections: true,
})

let sequelize = new Sequelize('bangtama',configDefaultDB.user,configDefaultDB.password,{
  host: 'localhost',
  dialect: 'mysql',
  logging: false
  //  ,
  // pool :{
  //   max: 50,
  //   min: 0,
  //   acquire: 1200000,
  //   idle: 1000000,
  // }
})

const connection =   () => {
  try {
    checkConnection.getConnection((err, connection) => {
      if (err) {
        console.error('Failed to connect to the database:', err.message)
        //connection.destroy()
        return
      }
      connection.release()
      sequelize.authenticate()
    })
  } catch (error) {
    console.log('An unexpected error occurred:', error.message)
  }
}

connection()

module.exports = {sequelize,Sequelize}



