const {
    normalizeQueryString
} = require("../utils/commonModules");

require("dotenv").config({
    path: "./utils/.env"
});

const {
    DB_DATABASE
} = process.env;

const ws_loadCategory = async (connection, filters = new Object(null), customQuery = null, resultLimit = 1000) => {
    let queryString = `SELECT TOP (${resultLimit}) 
    [categoryId]
    ,[title]
    ,[dateCreated]
    ,[dateModified]
    ,[timeCreated]
    ,[timeModified]
    ,[favourite]
    ,[checked]
    ,[deleted]
    ,[description]
    FROM [${DB_DATABASE}].[dbo].[tblCategory]
    WHERE deleted = 0;`;
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
        console.error("ws_loadCategory, SQL error: ", err);
        return {
            status: "Failed",
            method: "ws_loadCategory",
            msg: err
        }
    }
}

module.exports = {
    ws_loadCategory,
}