const express = require("express");
const categoryCtrlr = require("../controller/category");

const router = express.Router();

router.get("/category", categoryCtrlr.getCategory);


module.exports = router;