const {
    normalizeQueryString,
    normalizeQueryString_Create,
    checkDuplicate,
    NotNullColumnsFilled,
    getDate,
    getTime,
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

const ws_createTask = async (connection, details = new Object(null)) => {
    // details are the parameters sent for creating table
    const {
        title,
        categoryId
    } = details;

    // Not Null Values
    // NOTE: "title", "checked", "favourite", "deleted", "dateCreated", "timeCreated", "categoryId"
    let notNullColumns = ["title"];
    // NOTE: others have default Values
    if (!NotNullColumnsFilled(details, ...notNullColumns))
        return {
            status: "Failed",
            msg: "Fill Parameters Utterly",
            details,
            notNullColumns
        }

    // check for duplicates (unique Columns)
    // NOTE: "title" + categoryId
    const duplicateUniques = await checkDuplicate(connection, {
        title,
        categoryId: categoryId ? categoryId : 1
    }, ws_loadTask);
    if (duplicateUniques)
        return {
            status: "Failed",
            msg: "Error Creating Row, Violation of unqiue values",
            uniqueColumn: "title + categoryId",
            details
        }
    // NOTE: Auto Generate Date And Time
    const d = new Date();
    details.dateCreated = getDate(d);
    details.timeCreated = getTime(d);


    const {
        pool,
        poolConnect
    } = connection;
    // ensures that the pool has been created
    await poolConnect;

    let queryString = `INSERT INTO 
    [${DB_DATABASE}].[dbo].[tblTask] 
    ($COLUMN) 
    VALUES ($VALUE);
    SELECT SCOPE_IDENTITY() AS taskId;`;

    // normalizeQS_Create => (queryString, {title: "sth"}, ...configs)
    queryString = normalizeQueryString_Create(queryString, details);
    try {
        const request = pool.request();
        const result = await request.query(queryString);
        const id = result.recordset[0].taskId;
        return id;
    } catch (err) {
        console.error("ws_createTask SQL error: ", err);
        return {
            status: "Failed",
            method: "ws_createTask",
            msg: err
        }
    }
}

module.exports = {
    ws_loadTask,
    ws_createTask
}