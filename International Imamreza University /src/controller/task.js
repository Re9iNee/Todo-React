const {
    ws_loadTask
} = require("../services/task");
const {
    poolConnect,
    pool
} = require("../utils/todoDb");
exports.getTask = async (req, res) => {
    let query = req.query;
    // T03 - Method 01
    // NOTE: path = /task/?title="Read that Book"&category.title="Today"
    const result = await ws_loadTask({
        pool,
        poolConnect
    }, query);
    // TODO: type validation
    res.send({
        result
    })
}