const {
    normalizeQueryString,
    NotNullColumnsFilled,
    checkDuplicate,
    normalizeQueryString_Create,
    sqlDate,
    endIsLenghty,
    getDate,
    getTime,
    setToQueryString,
    loadDate,
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



const ws_updateCategory = async (connection, categoryId, newValues = new Object(null)) => {
    // inputs and params
    // NOTE: title, dateModified, timeModified, favourite, checked, description
    if (!newValues)
        return {
            status: "Failed",
            msg: "Send newValues to change table records",
            newValues
        }
    if (!categoryId)
        return {
            status: "Failed",
            msg: "Fill categoryId inside request JSON body",
            categoryId
        }
    const filteredRow = await ws_loadCategory(connection, {
        categoryId
    }, null, 1);

    if ("title" in newValues) {
        const {
            title
        } = newValues;
        const duplicateUniqueTitle = await checkDuplicate(connection, {
            title
        }, ws_loadCategory);
        if (duplicateUniqueTitle)
            return {
                status: "Failed",
                msg: "Error Creating Row, Violation of unique values",
                uniqueColumn: "title",
                newValues
            }
    }

    //  check for custome Validation
    // NOTE: dateModified should be bigger than dateCreated
    if ("dateModified" in newValues) {
        const {
            dateModified
        } = newValues;
        // loadDate:  Wed Jan 01 2020 03:30:00 GMT+0330 (Iran Standard Time) => 2021-09-23
        const dateCreated = loadDate(filteredRow.recordset[0].dateCreated.toString())
        let start = new sqlDate(dateCreated.split('-'));
        let end = new sqlDate(dateModified.split('-'));
        if (!endIsLenghty(start, end))
            return {
                status: "Failed",
                msg: "dateModified should be bigger than createdDate",
                dateCreated,
                dateModified
            }
    }


    let queryString = `UPDATE 
    [${DB_DATABASE}].[dbo].[tblCategory] SET `;
    // setToQueryString returns: UPDATE ... SET sth = 2 , test = 3
    queryString = setToQueryString(queryString, newValues) + " WHERE 1 = 1 ";
    queryString = normalizeQueryString(queryString, {
        categoryId
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
        const table = await ws_loadCategory(connection);
        return table;
    } catch (err) {
        console.error("ws_updateCategory SQL error: ", err);
        return {
            status: "Failed",
            method: "ws_updateCategory",
            msg: err
        }
    }
}

const ws_deleteCategory = async (connection, categoryId) => {
    // NOTE: we (soft)delete a row by updating its deleted column to -> true
    const filteredRow = await ws_loadCategory(connection, {categoryId}, null, 1);
    if (!filteredRow.recordset.length) 
        return {
            status: "Failed",
            msg: "Enter a valid categoryId",
            categoryId
        }
    return await ws_updateCategory(connection, categoryId, {
        deleted: 1
    });
}

module.exports = {
    ws_loadCategory,
    ws_createCategory,
    ws_updateCategory,
    ws_deleteCategory
}