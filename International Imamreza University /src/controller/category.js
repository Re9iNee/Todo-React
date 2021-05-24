const {
    ws_loadCategory,
    ws_createCategory,
    ws_updateCategory,
    ws_deleteCategory
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

exports.makeCategory = async (req, res) => {
    // T02 - Method 02
    // Attach params to body as an JSON Format
    const result = await ws_createCategory({
        pool,
        poolConnect
    }, req.body);
    res.send({
        result
    });
}


exports.updateCategory = async (req, res) => {
    // T02 - Method 03
    // Attach categoryId and newValues to request body.
    // parameters: sql connection, categoryId, newValues
    // output: categoryTable
    const result = await ws_updateCategory({
        pool,
        poolConnect
    }, req.body.categoryId, req.body.newValues);
    res.send({
        result
    });
}

exports.deleteCategory = async (req, res) => {
    // T02 - Method 04
    // parameters: sql connection, categoryId
    const result = await ws_deleteCategory({
        pool,
        poolConnect
    }, req.body.categoryId);
    res.send({
        result
    });
}