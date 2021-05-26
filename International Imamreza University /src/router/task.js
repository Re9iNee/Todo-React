const express = require("express");
const taskCtrlr = require("../controller/task");

const router = express.Router();

router.get("/task", taskCtrlr.getTask);

module.exports = router;