// /const generated = require('../helper/generate.js')

module.exports = (sequelize, Sequelize) => {
  let Logs = sequelize.define('send_message_logs', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: true,
    },
    ponumber: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    messages : {
      type : Sequelize.STRING,
      allowNull : false
    }
  },
  {
    scopes: {
      withHidden: {
        attributes: { exclude: ['id'] },
      },
      valueRequired: {
        attributes: ['ponumber', 'messages'],
      },
      valuePosted: {
        attributes: ['ponumber', 'messages'],
      }
    },
  })

  Logs.associate = () => {
    Logs.belongsTo(sequelize.models.orders, { foreignKey: 'ponumber',sourceKey: 'ponumber',as: 'docnum' });
  }

  return Logs
}
