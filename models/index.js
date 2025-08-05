"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
// const env = "development";
// const env = process.env.NODE_ENV || "production";
// const config = require(__dirname + "/../config/config.json")[env];
const app = require('../services/app.service');
const config = require(__dirname + '/../config/config.json')[app['env']];
const db = {};

var sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
// var sequelize = new Sequelize(config.database, 'leitstelle-development', config.password, config);

sequelize
  .authenticate()
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// db['Admin'].belongsTo(db['AdminRole'], { as: 'AdminRole', foreignKey: 'role_id', sourceKey: 'id' });

// db["User"].hasOne(db["Follower"], { as: "Follower", foreignKey: "from_user_id", });
// db['User'].belongsTo(db['Country'], {foreignKey : 'country_id'});
// db['User'].belongsTo(db['Province'], {foreignKey : 'province_id'});
// db['User'].belongsTo(db['District'], {foreignKey : 'district_id'});
// db['User'].belongsTo(db['SubDistrict'], {foreignKey : 'sub_district_id'});
// db['User'].hasOne(db['VerificationOtp'], { foreignKey: 'user_id', as: 'VerificationOtp' });
// db['User'].hasMany(db['Post'], { foreignKey: 'user_id', as: 'Post' });
// // db['User'].hasOne(db['Friendship'], {foreignKey : 'from_user_id', as : 'Friendship'});
// db['User'].hasMany(db['Friendship'], { foreignKey: 'to_user_id', as: 'toFriend' });
// db['User'].hasMany(db['Friendship'], { foreignKey: 'from_user_id', as: 'fromFriend' });
// db['Game'].hasOne(db['FavouriteGame'], { foreignKey: 'game_id', as: 'FavouriteGame' });
// db['FaqCategory'].hasMany(db['Faq'], { foreignKey: 'faq_category_id', as: 'Faq' });
// db['Post'].hasMany(db['PostAttachment'], { foreignKey: 'post_id', as: 'PostAttachment' });
// db['Post'].hasOne(db['Like'], { foreignKey: 'post_id', as: 'Like' });
// db['Post'].hasMany(db['Like'], { foreignKey: 'post_id', as: 'LikeData' });
// db['Post'].hasMany(db['Comment'], { foreignKey: 'post_id', as: 'Comment' });
// db['Post'].hasMany(db['TaggedUser'], { foreignKey: 'post_id', as: 'TagUser' });
// // db['User'].hasOne(db['TaggedUser'], { foreignKey: 'tagged_user_id', as: 'User' });
// db['TaggedUser'].belongsTo(db['User'], {foreignKey : 'tagged_user_id'});

// db['User'].hasMany(db['ContactSupport'], { foreignKey: 'user_id', as: 'userContact' });
// db['ContactReason'].hasMany(db['ContactSupport'], { foreignKey: 'contact_reason_id', as: 'ContactReason' });
// // db['Friendship'].hasOne(db['User'], {foreignKey : 'id', as : 'User'});

// db['User'].hasOne(db['BlockedUsers'], { foreignKey: 'to_user_id', as: 'fromUser' });

// db['MasterNotification'].hasOne(db['UserNotificationSetting'], { foreignKey: 'master_notification_id', as: 'UserNotification' });
// db['UserNotificationSetting'].belongsTo(db['MasterNotification'], {foreignKey : 'master_notification_id', as: "Notification"})

// db["Trophy"].hasOne(db["UserTrophy"], { as: "UserTrophy", foreignKey: "trophy_id", });

 db["BankAccount"].belongsTo(db["Bank"], { as: "bank", foreignKey: "bankId", });
 db["Member"].belongsTo(db["Bank"], { as: "banks", foreignKey: "bankId", });
 db["Customers"].belongsTo(db["Bank"], { as: "banks", foreignKey: "bankId", });

db["KayApi"].belongsTo(db["Merchant"], { as: "Merchants", foreignKey: "merchantId", });


 //db["TransactionsV2"].belongsTo(db["Request_All"], { as: "transaction_bank", foreignKey: "request_All_id", });
 //db["TransactionsV2"].belongsTo(db["Member"], { as: "members", foreignKey: "member_id", });
 //db["TransactionsV2"].belongsTo(db["Admin"], { as: "Admins", foreignKey: "reqby_admin_id", });
 db["TransactionsV2"].hasOne(db["Transaction_withdraw"], { as: "Transaction_withdraws", foreignKey: "transaction_id", });

 db["Transaction_manual"].belongsTo(db["Member"], { as: "members", foreignKey: "member_id", });
 
 db["Transaction_withdraw"].belongsTo(db["TransactionsV2"], { as: "Transactions", foreignKey: "transaction_id", });
 db["Transaction_withdraw"].belongsTo(db["Member"], { as: "members", foreignKey: "member_id", });
 db["Transaction_withdraw"].belongsTo(db["Admin"], { as: "Admins", foreignKey: "reqby_admin_id", });
 
 db["Transaction_withdraw"].belongsTo(db["BankAccount"], { as: "accfrom", foreignKey: "senderAccountId", });
 db['BankAccount'].hasMany(db['TransactionsV2'], { foreignKey: 'bankAccount_id', as: 'Transactions_by' });


 db["User_account"].belongsTo(db["Bank"], { as: "Banks", foreignKey: "bank_id", });
// //db["Member"].belongsTo(db["Bank"], { as: "Bank", foreignKey: "bank_id", });
db['BankAccount'].hasMany(db['Request_All'], { foreignKey: 'bankAccount_id', as: 'Request_Alls' });
db['BankAccount'].hasMany(db['Api_logs_banks'], { foreignKey: 'bankAccount_id', as: 'logs_banks' });
db['BankAccount'].hasMany(db['Botlog_limittime'], { foreignKey: 'bankAccountID', as: 'Botlog_limittimes' });
db['BankAccountGroup'].hasMany(db['BankAccount'], { foreignKey: 'bankAccountGroupId', as: 'bankAccounts' });
// db["Member"].hasOne(db["TransactionsV2"], { foreignKey: "current_Tranid_id",});
//db['Customers'].belongsTo(db['Bank'], {foreignKey : 'bank_code'});
db['Customers'].belongsTo(db['Merchant'], {foreignKey : 'merchantId'});

// db['History_tran'].belongsTo(db['Account_bank'], {foreignKey : 'accnum_from'})
//db['BankAccount'].belongsTo(db['Bank'], {foreignKey : 'bankId'});
db['BankAccount'].belongsTo(db['Request_All'], {foreignKey : 'accountNumber'});
db['Member'].belongsTo(db['Bank'], {foreignKey : 'bankId'});
db['Member'].belongsTo(db['Merchant'], {foreignKey : 'merchantId'});
//db['TransactionsV2'].belongsTo(db['Member'], {foreignKey : 'member_id'});
//db['TransactionsV2'].belongsTo(db['Request_All'], {foreignKey : 'request_All_id'});
db['Request_All'].belongsTo(db['BankAccount'], {foreignKey : 'bankAccount_id'});
db['BankAccount'].hasOne(db['Systemsettings'], { as: "setting", foreignKey: "bankAccountId", });

db['Merchant'].hasOne(db['Systemsettings'], { as: "setting_Merchant", foreignKey: "merchantId", });

db['BankAccountGroup'].hasMany(db['BankAccount'], { foreignKey: 'bankAccountGroupId', as: 'Withdrawal' });
db['BankAccountGroup'].hasMany(db['BankAccount'], { foreignKey: 'bankAccountGroupId', as: 'Deposit' });
// db["Account_bank"].belongsTo(db["Bank"], { as: "Bank", foreignKey: "bank_id", });

db['Role'].hasMany(db['RolePermission'], { foreignKey: 'roleId', as: 'permission' });
// db['Role'].hasMany(db['Getdata_permissionsv1'], { foreignKey: 'permissionId', as: 'permissions' });

db['Create_deposits'].belongsTo(db['BankAccount'], { foreignKey: 'bankAccount_id', as: 'BankAccounts' });
db['Create_deposits'].belongsTo(db['Merchant'], { foreignKey: 'merchantId', as: 'Merchants' });
 db["TransactionsV2"].belongsTo(db["Create_deposits"], { as: "Create_deposits_uuid", foreignKey: "create_deposits_id", });



db['RolePermission'].belongsTo(db['Getdata_permissionsv1'], { foreignKey: 'permissionId', as: 'permission' });
db['BankPlatform'].belongsTo(db['Bank'], { foreignKey: 'bankId', as: 'banks' });

 db["Transaction_tranfer"].belongsTo(db["BankAccount"], { foreignKey: 'bankAccountfromid', as: 'FormAccount' });
 db["Transaction_tranfer"].belongsTo(db["BankAccount"], { foreignKey: 'bankAccounttoid', as: 'TOAccount' });
 db["Transaction_tranfer"].belongsTo(db["Admin"], { foreignKey: 'reqby_admin_id', as: 'admin' });

// db["History_tran"].belongsTo(db["Bank"], { as: "Banks",foreignKey: "bank_from_id", });
//db['Create_deposits'].belongsTo(db['Customers'], { foreignKey: 'customerUuid', as: 'customer' });

// // start RequestToPlay table associates
// // db['User'].hasMany(db['RequestToPlay'], { foreignKey: 'user_id', as: 'userRequest' });
// // db['Game'].hasMany(db['RequestToPlay'], { foreignKey: 'game_id', as: 'gameUserRequest' });
// // db['RequestToPlay'].belongsTo(db['User'], {foreignKey : 'user_id'})
// // db['RequestToPlay'].belongsTo(db['Game'], {foreignKey : 'game_id'})
// //end RequestToPlay table associates

// // start UserGameStatus table associates
// db['User'].hasMany(db['UserGameStatus'], { foreignKey: 'user_id', as: 'userStatusRequest' });
// db['Game'].hasMany(db['UserGameStatus'], { foreignKey: 'game_id', as: 'gameUserStatusRequest' });
// db['UserGameStatus'].belongsTo(db['User'], {foreignKey : 'user_id'})
// db['UserGameStatus'].belongsTo(db['Game'], {foreignKey : 'game_id'})
// // end UserGameStatus table associates

// // start team table associates
// db['Game'].hasMany(db['Team'], { foreignKey: 'game_id', as: 'team' });
// db['Team'].belongsTo(db['Game'], {foreignKey : 'game_id'})
// // end team table associates

// // start team participant table associates
// db['Team'].hasMany(db['TeamParticipant'], { foreignKey: 'team_id', as: 'TeamParticipant' });
// // db['TeamParticipant'].belongsTo(db['Team'], {foreignKey : 'team_id', as: 'TeamParticipant'});
// db['Game'].hasMany(db['TeamParticipant'], { foreignKey: 'game_id', as: 'GameParticipant' });
// db['TeamParticipant'].belongsTo(db['Game'], {foreignKey : 'game_id'})
// db['User'].hasOne(db['TeamParticipant'], { foreignKey: 'user_id', as: 'UserParticipant' });
// db['TeamParticipant'].belongsTo(db['User'], {foreignKey : 'user_id'})
// // end team participant table associates


// //start match table associates
// db['Game'].hasMany(db['Match'], { foreignKey: 'game_id', as: 'Match' });
// db['Match'].belongsTo(db['Game'], {foreignKey : 'game_id'})

// db['Match'].belongsTo(db['Team'], {foreignKey : 'team_one_id', as: 'MatchTeamOne'})
// db['Match'].belongsTo(db['Team'], {foreignKey : 'team_two_id', as: 'MatchTeamtwo'})
// db['Match'].belongsTo(db['Team'], {foreignKey : 'win_team_id', as: 'MatchWinTeam'})
// db['Match'].belongsTo(db['Team'], {foreignKey : 'lose_team_id', as: 'MatchLoseTeam'})
// //end match table associates


// db['Post'].belongsTo(db['User'], {foreignKey : 'user_id'});
// db['Comment'].belongsTo(db['Post'], {foreignKey : 'post_id'});
// db['Comment'].belongsTo(db['User'], {foreignKey : 'user_id'});
// db['Faq'].belongsTo(db['FaqCategory'], {foreignKey : 'faq_category_id'})
// db['ContactSupport'].belongsTo(db['ContactReason'], {foreignKey : 'contact_reason_id'})
// db['ContactSupport'].belongsTo(db['User'], {foreignKey : 'user_id'})
// db['Item'].belongsTo(db['Menu_backend'], {foreignKey : 'menu_backend_id'})
// db['Menu_backend'].belongsTo(db['Item'], {foreignKey : 'items_id'})



// // Start Message
// db['ChatGroup'].hasOne(db['ChatParticipant'], { foreignKey: 'chat_group_id', as: 'ChatParticipant' });
// db['ChatMessage'].hasMany(db['ChatAttachment'], {  foreignKey: 'chat_message_id', as: 'ChatAttachment' });
// db['ChatMessage'].belongsTo(db['ChatGroup'], {  foreignKey: 'chat_group_id', as: 'ChatGroup' });
// db['ChatMessage'].belongsTo(db['User'], { foreignKey: 'user_id', as: 'User' });
// db['ChatMessage'].belongsTo(db['Team'], { foreignKey: 'team_id', as: 'Team' });
// // End Message

// //start notification message
// db['NotificationMessage'].belongsTo(db['Team'], { foreignKey: 'team_id', as: 'Team' });
// db['NotificationMessage'].belongsTo(db['User'], {foreignKey : 'from_user_id', as: 'FromNotiUser' });
// db['NotificationMessage'].belongsTo(db['User'], {foreignKey : 'to_user_id', as: 'ToNotiUser' });
// //end notification message

// //Start NFT Category
// db['NftItem'].belongsTo(db['NftCategory'], { foreignKey: 'nft_category_id', as: 'NftCategory' });

// db['NftItem'].hasMany(db['NftUserItem'], { foreignKey: 'nft_item_id', as: 'NftUserItem' });


// db['UserSpriteAvatar'].belongsTo(db['NftItem'], { foreignKey: 'nft_item_id', as: 'NftItem' });
// //End NFT Category

// //Start User Game Status

// db["Match"].hasOne(db["TeamParticipant"], { foreignKey: "game_id", as: "MatchTeamParticipant"  });
// db['TeamParticipant'].belongsTo(db['Match'], { foreignKey: 'game_id'});

// db['TeamParticipant'].belongsTo(db['Game'], { foreignKey: 'game_id', as: 'MatchGame' });


// db["Game"].hasOne(db["TeamParticipant"], { foreignKey: "game_id", as: "UserGames"  });

// //End User Game Status

// //Start User Rank List
// db['UserRanking'].belongsTo(db['Ranking'], { foreignKey: 'ranking_id', as: 'UserWiseRanking' });
// db['UserRanking'].hasOne(db['UserGameHistory'], { foreignKey: 'game_id', as: 'UserGameHistory' });

// //Start User Rank list


// //Start User Followers List
// db["User"].hasOne(db["Follower"], { foreignKey: "from_user_id", });
// db['Follower'].belongsTo(db['User'], { foreignKey: 'from_user_id', as: "UserFollowers" });


// db["User"].hasOne(db["Follower"], { foreignKey: "to_user_id", });
// db['Follower'].belongsTo(db['User'], { foreignKey: 'to_user_id',  as: "UserFollowing" });
// //Start User Followers list

// //start leader board
// db['User'].hasOne(db['UserGameHistory'], { foreignKey: 'user_id', as: 'UserGameHistory' });
// db['UserGameHistory'].belongsTo(db['User'], { foreignKey: 'user_id',  as: "UserDetail" });
// db['UserGameHistory'].belongsTo(db['Game'], { foreignKey: 'game_id',  as: "GameDetail" });

// //end leader board
// db["LinkGame"].hasOne(db["UserLinkGame"], { foreignKey: "link_game_id", as: "UserLinkGame"  });

// db['UserLinkGame'].belongsTo(db['LinkGame'], { foreignKey: 'link_game_id'});

// db['User'].hasOne(db['FriendRequest'], { foreignKey: 'to_user_id', as: 'requestTo' });
// db['User'].hasOne(db['FriendRequest'], { foreignKey: 'from_user_id', as: 'requestFrom' });
// db['User'].hasOne(db['Friend'], { foreignKey: 'user_id', as: 'FriendFrom' });
// db['User'].hasOne(db['Friend'], { foreignKey: 'friend_id', as: 'friend' });
// db['FriendRequest'].belongsTo(db['User'], { foreignKey: 'to_user_id',  as: "friendRequestTo" });
// db['FriendRequest'].belongsTo(db['User'], { foreignKey: 'from_user_id',  as: "friendRequestFrom" });

db.sequelize = sequelize;

module.exports = db;
