// /const generated = require('../helper/generate.js')

module.exports = (sequelize, Sequelize) => {
  let User = sequelize.define('users', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: true,
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone1: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isNumeric: {
          args: true,
          msg: 'Phone number must contain numeric characters only.',
        },
        len: {
          args: [10, 16],
          msg: 'Phone number length must be between 10 and 16 characters.',
        },
      },
    },
    latest_login: {
      type: Sequelize.DATE,
    },
    role: {
      type: Sequelize.STRING,
    },
    registred: {
      type: Sequelize.DATE,
      allowNull: true
    },
    is_blocked : {
      type : Sequelize.BOOLEAN,
      defaultValue : false,
      allowNull : true
    }
  },
  {
    scopes: {
      withHidden: {
        attributes: { exclude: ['id', 'password', 'latest_login','role'] },
      },
      valueRequired: {
        attributes: ['username', 'phone1'],
      },
      valuePosted: {
        attributes: ['username', 'phone1', 'password'],
      },
      valueSignIn :{
        attributes : ['username','password']
      },
      Aliases :{
        attributes : [['username', 'name'],['phone1','phone_number']]
      }
    },
  })

  User.associate = () => {
    User.hasMany(sequelize.models.orders, { foreignKey: 'user_id', as: 'userorders' });
  }

  return User
}
