module.exports = (sequelize, Sequelize) => {
  let Order = sequelize.define('orders', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ponumber: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isAlpha(value) {
            if (!/^[a-zA-Z0-9 -]+$/.test(value)) {
              throw new Error('Please only character.!');
            }
          },
      }
    },
    amount :{
      type : Sequelize.DECIMAL(10,2),
      defaultValue : 0,
      allowNull : true
    },
    totalPO :{
      type : Sequelize.INTEGER,
      defaultValue : 0,
      allowNull : true
    },
    odrStatuses :{
      type : Sequelize.ENUM('on payment','received','send'),
      defaultValue : 'on payment',
      allowNull : true,
    },
    user_id :{
      type :Sequelize.INTEGER,
      allowNull : false
    }
  },
  {
    scopes: {
      withHidden: {
        attributes: { exclude: ['id','user_id'] },
      },
      valueRequired: {
        attributes: [ 'ponumber','line','prdid','ordprdtotal'],
      },
      valueRequired2: {
        attributes: [ 'amount', 'totalPO','ponumber','odrStatuses','user_id'],
      },
      valuePosted: {
        attributes: ['amount', 'totalPO','ponumber','odrStatuses','user_id'],
      },
      valueFirstValidate: {
        attributes: [{'Product': 'prdid'},{'User' : 'phone1'}],
      }
    },
  })

  Order.associate = () =>{
    //Order.hasOne(sequelize.models.users, { as:'userss', foreignKey: 'id', sourceKey: 'user_id' });
    Order.belongsTo(sequelize.models.users, { foreignKey: 'user_id', as: 'users' });

    Order.hasMany(sequelize.models.order_lines, { as: 'orderlines', foreignKey: 'ponumber',sourceKey : 'ponumber'})
  }
  
  return Order
}
