const express = require("express");
const SearchRouter = express.Router();

const passport = require("passport");

const userMidd = require("../middleware/app.user");
const userMiddchack = require("../middleware/authenticate");
require("../middleware/passport")(passport);

const SearchControllers = require("../controllers/search.controllers");




SearchRouter.post("/getSearchDataTransaction", SearchControllers.getSearchDataTransaction);


module.exports = SearchRouter;
