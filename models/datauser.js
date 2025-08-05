"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Datauser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Datauser.init(
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      userStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cardType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      titleTH: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nameTH: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      middleNameTH: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastNameTH: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      titleEN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nameEN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      middleNameEN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastNameEN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registerDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      tcAcceptDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      promptpayTcAcceptDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tcAcceptVersion: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      promptpayTcAcceptVersion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      maskAccountFlag: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      profilePhotoPath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobileNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      buzzebeeHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      buzzebeeBaseURL: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailNotificationFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bulkActivateDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      mutualFundTcAcceptDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      mutualFundTcAcceptVersion: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      themeFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      predictiveFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailVerificationFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fastpayFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registerCardRef: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registerCardType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registerChannel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verificationRequiredFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      relationFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userMode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referredFriendFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      blockReasonCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      blockReasonDescription: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      migrationFlag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      redirectURL: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_account_id: {
        type: DataTypes.INTEGER,
        references: { model: "bankAccount", key: "id" },
        onDelete: "CASCADE",
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Datauser",
      tableName: "datauser",
      deletedAt: "deleted_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      //  paranoid: true, //use for soft delete with using deleted_at
      // underscored: true, //making underscored colomn as deletedAt to deleted_at
    }
  );
  return Datauser;
};
