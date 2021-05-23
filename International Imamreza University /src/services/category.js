const {
    normalizeQueryString,
    NotNullColumnsFilled,
    checkDuplicate,
    normalizeQueryString_Create,
    sqlDate,
    endIsLenghty,
    getDate,
    getTime
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
    ,[description]
    FROM [${DB_DATABASE}].[dbo].[tblCategory]
    WHERE deleted = 0 `;
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


const ws_createCategory = async (connection, details = new Object(null)) => {
    // details are the parameters sent for creating table
    const {
        title
    } = details;

    // Not Null Values
    // NOTE: "title", "dateCreated", "timeCreated", "favourite", "checked"
    let notNullColumns = ["title"];
    if (!NotNullColumnsFilled(details, ...notNullColumns))
        return {
            status: "Failed",
            msg: "Fill Parameters Utterly",
            details,
            notNullColumns
        }

    // check for duplicates (unique Columns)
    // NOTE: "title"
    const duplicateUniqueTitle = await checkDuplicate(connection, {
        title
    }, ws_loadCategory);
    if (duplicateUniqueTitle)
        return {
            status: "Failed",
            msg: "Error Creating Row, Violation of unique values",
            uniqueColumn: "title",
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
    [${DB_DATABASE}].[dbo].[tblCategory] 
    ($COLUMN)
    VALUES ($VALUE);
    SELECT SCOPE_IDENTITY() AS categoryId;`;
    // normalizeQS_Create => (queryString, {title: "sth"}, ...configs)
    queryString = normalizeQueryString_Create(queryString, details);
    try {
        const request = pool.request();
        const result = await request.query(queryString);
        const id = result.recordset[0].categoryId;
        return id;
    } catch (err) {
        console.error("ws_createCategory SQL error: ", err);
        return {
            status: "Failed",
            method: "ws_createCategory",
            mgs: err
        }
    }
}

// TODO: for update method
//  // check for custome Validation
//     // NOTE: dateModified should be after dateCreated
//     if ("dateModified" in details) {
//         let start = new sqlDate(dateCreated.split('-'));
//         let end = new sqlDate(dateModified.split('-'));
//         let sth = endIsLenghty(start, end);
//         debugger
//     }

module.exports = {
    ws_loadCategory,
    ws_createCategory,
}