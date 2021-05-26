const express = require("express");
const taskCtrlr = require("../controller/task");

const router = express.Router();

router.get("/task", taskCtrlr.getTask);
router.post("/task", taskCtrlr.makeTask);

module.exports = router;