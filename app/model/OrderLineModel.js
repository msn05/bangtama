module.exports = (sequelize, Sequelize) => {
  let OrderLine = sequelize.define('order_lines', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ponumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    line :{
      type : Sequelize.INTEGER,
      defaultValue : 1,
      allowNull : false
    },
    prdid :{
      type : Sequelize.INTEGER,
      allowNull : false
    },
    ordprdtotal :{
      type : Sequelize.INTEGER,
    },
    amount :{
      type : Sequelize.DECIMAL(10,2),
    },
    prdamount :{
      type : Sequelize.DECIMAL(10,2),
    },
    odrlinestatuses :{
      type : Sequelize.ENUM('fix','canceled'),
      defaultValue : 'fix'
    }
  },
  {
    scopes: {
      withHidden: {
        attributes: { exclude: ['id'] },
      },
      valuePosted: {
        attributes: ['ponumber', 'line','prdid','amount','prdamount','ordprdtotal','odrlinestatuses'],
      },
      valueRequired: {
        attributes: ['line','prdid','amount','ordprdtotal'],
      },
      Aliases : {
        attributes : [
          ['line','no'],['amount','amount'],['ordprdtotal','total_order'],['prdamount','grand_total']
        ]
      },
      valueFiltering : {
        attributes : {'odrlinestatuses' : 'fix'}
      }
    },
  })

  OrderLine.associate = () => {
      OrderLine.belongsTo(sequelize.models.orders, {foreignKey: 'ponumber' })
      OrderLine.belongsTo(sequelize.models.products, {foreignKey: 'prdid', as : 'products' })
  }

  return OrderLine
}
