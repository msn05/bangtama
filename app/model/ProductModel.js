// /const generated = require('../helper/generate.js')

module.exports = (sequelize, Sequelize) => {
  let Product = sequelize.define('products', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: true,
    },
    prdName: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isAlpha(value) {
            if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
              throw new Error('Please only character.!');
            }
          },
      },
    },
    prdDescription: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate : {
        isAlpha(value) {
          if (!/^[a-zA-Z ]+$/.test(value)) {
            throw new Error('Please only character.!');
          }
        },
      }
    },
    prdImage: {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '-', 
      get() {
        const value = this.getDataValue('prdImage')
        return value === null || value.toString() === '-' ? '-' : value
      },
    },
    minPO :{
      type : Sequelize.INTEGER,
      defaultValue : 4
    },
    readyPO :{
      type : Sequelize.ENUM('y','n','p'),
      defaultValue : 'p'
    },
    pricePCS :{
      type :Sequelize.DECIMAL(10,2),
      allowNull : false
    },
    is_deleted : {
      type : Sequelize.BOOLEAN,
      defaultValue : false,
      allowNull : true,
    }
  },
  {
    scopes: {
      withHidden: {
        attributes: { exclude: ['id', 'createdAt', 'updatedAt','is_deleted'] },
      },
      valueRequired: {
        attributes: ['prdName', 'prdDescription','minPO','readyPO','pricePCS'],
      },
      valuePosted: {
        attributes: ['prdName', 'prdDescription','prdImage','minPO', 'readyPO','pricePCS'],
      },
      valueFiltering : {
        attributes : [{'is_deleted' : 0}]
      },
      Aliases : {
        attributes : [
          ['prdName','name'], ['prdDescription','description']
        ]
      }
    },
  })

  Product.associate = () => {
    OrderLine.hasMany(sequelize.models.order_lines, {foreignKey: 'prdid',sourceKey:'id', as : 'orderlines'})
}
  return Product
}
