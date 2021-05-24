const express = require("express");
const categoryCtrlr = require("../controller/category");

const router = express.Router();

router.get("/category", categoryCtrlr.getCategory);
router.post("/category", categoryCtrlr.makeCategory);
router.put("/category", categoryCtrlr.updateCategory);
router.delete("/category", categoryCtrlr.deleteCategory);


module.exports = router;