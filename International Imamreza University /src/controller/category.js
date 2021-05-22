const {
    ws_loadCategory,
} = require("../services/category");
const {
    poolConnect,
    pool
} = require("../utils/todoDb");
exports.getCategory = async (req, res) => {
    let query = req.query;
    // T02 - Method 01
    // path = /category/?title=Today&categoryId=1
    const result = await ws_loadCategory({
        pool,
        poolConnect
    }, {
        categoryId: query.categoryId,
        title: query.title,
        dateCreated: query.dateCreated,
        timeCreated: query.timeCreated,
        dateModified: query.dateModified,
        timeModified: query.timeModified,
        favourite: query.favourite,
        checked: query.checked,
        description: query.description
    });
    // Deconstrucing query object prevents app from throwing typo errors.
    res.send({
        result
    })
}