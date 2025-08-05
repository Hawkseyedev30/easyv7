"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("customers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      partner: {
        type: Sequelize.STRING,
      },
      client_code: {
        type: Sequelize.STRING,
      },
      name_en: {
        type: Sequelize.STRING,
      },
      name_th: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      search_name: {
        type: Sequelize.STRING,
      },
      account_no: {
        type: Sequelize.STRING,
      },
      merchantId: {
        type: Sequelize.INTEGER,
        references: { model: "merchant", key: "id" },
        // onDelete: "CASCADE",
        allowNull: true
      },
      bank_code: {
        type: Sequelize.STRING,
        allowNull: false,

      },
      bankId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bank',
          key: 'id',
        },
      },
      status: {
        type: Sequelize.STRING,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("customers");
  },
};