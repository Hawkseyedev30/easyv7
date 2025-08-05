require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./services/app.service");
const AdminRouter = require("./routes/addmin.routes");
const AuthRouter = require("./routes/auth.routes");
const kbizRouter = require("./routes/kbiz");
const MerchangRouter = require("./routes/merchang.routes");
const Merchangv2Router = require("./routes/merchangv2.routes");
//const logRequestTime = require('./controllers/logRequestTime');
const SearchRouter = require('./routes/search.routes');

var { Member, Admin } = require("./models");

const socketIo = require("socket.io");

app.use(express.json({ limit: "25mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to API dev Payment" });
});
//app.engine("html", require("ejs").renderFile);
//app.use(logRequestTime);

app.use("/storage", express.static(__dirname + "/storage"));
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/kbiz", kbizRouter);
app.use("/api/v1/merchans", MerchangRouter);
app.use("/api/v2/merchans", Merchangv2Router);
app.use("/api/v1/admin", AdminRouter);
app.use("/api/v5/admin", AdminRouter);
app.use("/api/v1/search", SearchRouter);

const PORT = process.env.PORT || config["port"];
let server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
async function checkUser(user) {
  //console.log(user);
  let err, check;
  [err, check] = await to(
    Admin.findOne({
      where: {
        username: user,
      },
    })
  );
  //console.log(check);
  if (err) {
    return { success: false, message: err.message, data: "" };
  }
  if (!check) {
    return { success: false, message: "ไม่พบข้อมูลในระบบ", data: "" };
  }

  return { success: true, message: "ไม่พบข้อมูลในระบบ", data: check };
}
// start socket
const io = socketIo(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: [
      config["req_base_url"],
      config["base_url"],
      config["web_front_req_base_url"],
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // ************************* start socket for adminlogin  *************************

  function getRandomBackgroundColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  let onlineUsers = {}; // เก็บข้อมูลผู้ใช้ออนไลน์
  socket.on("adminOnline", async (name) => {
    let adminOnline = name;
    let data = await checkUser(adminOnline);
    if (data.success === false) {
      socket.emit("error", data.message);
      return;
    }
    onlineUsers[adminOnline] = {
      name: adminOnline,
      data: data.data,
      time: moment().format("YYYY-MM-DD HH:mm:ss"),
      timeFromNow: moment().fromNow(),
      online: true,
      backgroundColor: getRandomBackgroundColor(),
    };
    console.log(`${adminOnline} Online`);
    io.emit("Online", onlineUsers[adminOnline]);

    io.emit("onlineCount", Object.keys(onlineUsers).length);

    socket.on("disconnect", () => {
      console.log(`${adminOnline} Disconnected`);
      delete onlineUsers[adminOnline];
      io.emit("Offline", {
        name: adminOnline,
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
        timeFromNow: moment().fromNow(),
        online: false,
      });
      io.emit("onlineCount", Object.keys(onlineUsers).length);
    });
  });
  // ************************* end socket for adminlogin  *************************

  //  console.log(socket);
  socket.on("search_team", (data) => {
    socket.join(data);

    io.emit("receive_message", data);
  });

  socket.on("is_found_team", async (data) => {
    socket.to(data.team_room_id).emit("get_myteam", data);
  });

  socket.on("ready_to_search", async (data) => {
    //  console.log(data);
    io.emit("receive_message", data);
  });

  socket.on("ready_dispro", async (data) => {
    let max = await Apichack.getWinLoseAndTurnOver(data);
    //console.log(data);
    io.emit("ready_disproto", max);
  });
  socket.on("sendNotification_live", async (data) => {
    // console.log(data);
    io.emit("create_msgadmin", data);
  });

  socket.on("create_msg", async (data) => {
    //console.log(data);
    io.emit("create_msgadmin", data);
  });
  socket.on("sendNotification_dis", async (data) => {
    console.log(data);
    io.emit("create_msgadmin", data);
  });
  socket.on("sendNotification_linebot", async (data) => {
    console.log(data);
    io.emit("create_sendNotification_linebot", data);
  });

  socket.on("set_cancel_to_search_match", async (data) => {
    socket.to(data.team_room_id).emit("get_cancel_to_search_match", data);
  });

  socket.on("leaved_team", async (data) => {
    socket.to(data.team_room_id).emit("search_team_after_leaved", data);
  });

  socket.on("leave_match", async (data) => {
    socket.to(data.lobby_room_id).emit("search_match_after_oppo_leaved", data);
  });

  // end search team

  // start create match scoket
  socket.on("set_join_game_participant", async (data) => {
    socket.to(data.team_room_id).emit("get_join_game_participant", data);
  });

  socket.on("set_readytoOppoSearch_createTeam", async (data) => {
    socket.to(data.team_room_id).emit("get_readytoOppoSearch_createTeam", data);
  });

  socket.on("set_update_bet_amount", async (data) => {
    socket.to(data.team_room_id).emit("get_update_bet_amount", data);
  });

  socket.on("set_host_leave", async (data) => {
    socket.to(data.team_room_id).emit("get_host_leave", data);
  });

  socket.on("set_team_search", async (data) => {
    socket.to(data.team_room_id).emit("get_team_search", data);
  });
  // end create match socket

  //start search match lobby
  socket.on("search_match", (data) => {
    socket.join(data);
  });

  socket.on("set_countdown_cancel_search", async (data) => {
    socket.to(data.lobby_room_id).emit("get_countdown_cancel_search", data);
  });

  socket.on("is_ready_to_oppo_search", async (data) => {
    socket.to(data.lobby_room_id).emit("get_ready_to_oppo_search", data);
  });

  socket.on("ready_to_plays", async (data) => {
    // socket.to(data.re_check_friends_status_room_id).emit("get_re_check_friends_status", data.onlineFriends); // re check friends status
    // delete data.onlineFrnds

    console.log(data);
    // socket.to(data.lobby_room_id).emit("get_ready_to_play_user", data);
  });

  socket.on("ready_to_play_via_socket", async (data) => {
    socket.to(data.lobby_room_id).emit("get_ready_to_play_via_socket", data);
  });

  socket.on("set_game_result", async (data) => {
    socket.to(data.lobby_room_id).emit("get_game_result", data);
  });

  socket.on("set_total_accepted_match_usercount", async (data) => {
    socket
      .to(data.lobby_room_id)
      .emit("get_total_accepted_match_usercount", data);
  });

  socket.on("set_not_acceptedTeam", async (data) => {
    socket.to(data.lobby_room_id).emit("get_not_acceptedTeam", data);
  });

  socket.on("set_not_acceptedTeam1", async (data) => {
    socket.to(data.lobby_room_id).emit("get_not_acceptedTeam11", data);
  });

  socket.on("leave_room2", async (data) => {
    socket.emit("get_ready_to_play_user", data);

    // console.log(data)
    //  socket.to(data).emit("get_ready_to_play_user2", data);
  });

  //end search match lobby

  //start custom game
  socket.on("create_room", async (data) => {
    socket.to(data.custom_room_id).emit("get_created_room_list", data);
  });

  socket.on("join_custom_room", async (data) => {
    socket.to(data.custom_room_id).emit("get_user_join_data", data);
  });

  socket.on("leave_custom_game", async (data) => {
    socket.to(data.custom_room_id).emit("get_leaved_room_status", data);
  });

  socket.on("ready_custom_game", async (data) => {
    socket.to(data.custom_room_id).emit("get_ready_room_status", data);
  });

  socket.on("set_update_customroom_bet_amount", async (data) => {
    socket
      .to(data.custom_room_id)
      .emit("get_update_customroom_bet_amount", data);
  });
  // end custom game

  //start social
  socket.on("set_friend_request", async (data) => {
    socket.to(data.room_id).emit("get_acceptReject_request", data);
  });
  //end social
  socket.on("send_notification", (data) => {
    // Assuming 'data' contains:
    //   - to: recipient user ID or room ID
    //   - message: the notification message
    console.log(data);
    // Emit the notification to the recipient
    socket.to(data.to).emit("receive_notification", data.message);
  });
  //start notification
  socket.on("set_notification", async (data) => {
    let max = await Apichack.getWinLoseAndTurnOver(data);
    // const notified = await getUserNotifiedStatusByType(
    //   NotificationType.alertWithSound,
    //   data.toUserID
    // );

    console.log(max);
    // data.isAlertWithSount = notified;
    socket.to(data.room_id).emit("get_notification", max);
  });
  //end notification

  //start chat
  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("leave_room", (data) => {
    console.log(data);
    socket.leave(data);
  });

  socket.on("send_message", async (data) => {
    socket.to(data.chat_group_name).emit("receive_message", data);
  });

  socket.on("set_online_offline_user_status", async (data) => {
    socket.to(data.lobby_room_id).emit("get_online_offline_user_status", data);
  });

  socket.on("set_onlineOfflineUser_status", async (data) => {
    socket
      .to(data.onlineOfflineRoom)
      .emit("get_onlineUser_status", data.onlineFriends);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
  // socket.disconnect(true)
});

// end socket
