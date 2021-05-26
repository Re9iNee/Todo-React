const {
    normalizeQueryString,
    normalizeQueryString_Create,
    checkDuplicate,
    NotNullColumnsFilled,
    getDate,
    getTime,
    setToQueryString,
    loadDate,
    sqlDate,
    endIsLenghty,
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

const ws_updateTask = async (connection, taskId, newValues = new Object(null)) => {
    // inputs and params
    // NOTE: title, dateModified, timeModified, favourite, checked, categoryId
    if (!Object.entries(newValues).length)
        return {
            status: "Failed",
            msg: "Send newValues to change table records",
            newValues
        }
    if (!taskId)
        return {
            status: "Failed",
            msg: "Insert taskId inside request JSON body",
            taskId
        }

    const filteredRow = await ws_loadTask(connection, {
        taskId
    }, null, 1);
    //TODO: change categoryId on this record [feature]
    if ("title" in newValues) {
        const {
            title
        } = newValues;
        const categoryId = filteredRow.recordset[0].categoryId;
        // NOTE: Unique Columns: "title" + categoryId
        const duplicateUniques = await checkDuplicate(connection, {
            title,
            categoryId
        }, ws_loadTask);
        if (duplicateUniques)
            return {
                status: "Failed",
                msg: "Error Creating Row, Violation of unique values",
                uniqueColumn: "title",
                newValues
            }
    }

    // check for custome Validation
    // NOTE: dateModified should be bigger than dateCreated
    if ("dateModified" in newValues) {
        const {
            dateModified
        } = newValues;
        // loadDate: Wed Jan 01 2020 03:30:00 GMT+0330 (Iran Standard Time) => 2021-09-23
        const dateCreated = loadDate(filteredRow.recordset[0].dateCreated.toString());
        const start = new sqlDate(dateCreated.split('-'));
        const end = new sqlDate(dateModified.split('-'));
        if (!endIsLenghty(start, end))
            return {
                status: "Failed",
                msg: "dateModified should be bigger than createdDate",
                dateCreated,
                dateModified
            }
    }

    let queryString = `UPDATE
    [${DB_DATABASE}].[dbo].[tblTask] SET `;
    // setToQueryString returns: UPDATE ... SET sth = 2, test = 'OK'
    queryString = setToQueryString(queryString, newValues) + " WHERE 1 = 1 ";
    queryString = normalizeQueryString(queryString, {
        taskId
    });
    const {
        pool,
        poolConnect
    } = connection;
    // ensures that the pool has been created
    await poolConnect;

    try {
        const request = pool.request();
        const updateResult = await request.query(queryString);
        // return table records
        const table = await ws_loadTask(connection);
        return table;
    } catch (err) {
        console.error("ws_updateTask SQL error: ", err);
        return {
            status: "Failed",
            method: "ws_updateCategory",
            msg: err
        }
    }
}

const ws_deleteTask = async (connection, taskId) => {
    // NOTE: we (soft)delete a row by updating its "deleted" column to -> true
    const filteredRow = await ws_loadTask(connection, {taskId}, null, 1);
    if (!filteredRow.recordset.length)
        return {
            status: "Failed",
            msg: "Enter a valid taskId",
            taskId
        }
    return await ws_updateTask(connection, taskId, {
        deleted: 1
    });
}


// TODO: PURGE all deleted tasks - or purge them one by one.
module.exports = {
    ws_loadTask,
    ws_createTask,
    ws_updateTask,
    ws_deleteTask
}