"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("verification_otps", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        references: { model: "admin", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      user_device_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiration_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
        allowNull: false,
      },
      otp_type: {
        type: Sequelize.ENUM("Login", "Payment", "Wallet"),
        allowNull: false,
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("verification_otps");
  },
};
