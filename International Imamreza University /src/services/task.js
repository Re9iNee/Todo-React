const {
    normalizeQueryString
} = require("../utils/commonModules");

require("dotenv").config({
    path: "./utils/.env"
});

const {
    DB_DATABASE
} = process.env;

const ws_loadTask = async (connection, filters = new Object(null), customQuery = null, resultLimit = 1000) => {
    let queryString = `SELECT TOP (${resultLimit}) 
        [taskId]
        ,task.[title]
        ,task.[checked]
        ,task.[favourite]
        ,task.[dateCreated]
        ,task.[dateModified]
        ,task.[timeCreated]
        ,task.[timeModified]
        ,task.[categoryId]
    FROM [${DB_DATABASE}].[dbo].[tblTask] as task
    INNER JOIN [${DB_DATABASE}].[dbo].[tblCategory] as category
    on category.categoryId = task.categoryId
    WHERE 
    task.deleted = 0
    AND 
    category.deleted = 0 `;

    // NOTE: Ambiguous column names
    const regexr = /^category\./;
    for (let column in filters) {
        if (!column.match(regexr)) {
            filters[`task.${column}`] = filters[column];
            delete filters[column];
        }
    }

    const {
        pool,
        poolConnect
    } = connection;
    // ensures that the pool has been created
    await poolConnect;

    queryString = normalizeQueryString(queryString, filters);
    if (customQuery)
        queryString += ` ${customQuery}`;

    try {
        const request = pool.request();
        const result = await request.query(queryString);
        return result;
    } catch (err) {
        console.error("ws_loadTask, SQL error: ", err);
        return {
            status: "Failed",
            method: "ws_loadCategory",
            msg: err
        }
    }
}

module.exports = {
    ws_loadTask,
}