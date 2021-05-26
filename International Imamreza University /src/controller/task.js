const {
    ws_loadTask, ws_createTask
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

exports.makeTask = async (req, res) => {
    // T03 - Method 02
    // Attach params to body as an JSON Format
    const result = await ws_createTask({
        pool,
        poolConnect
    }, req.body);
    res.send({
        result
    })
}