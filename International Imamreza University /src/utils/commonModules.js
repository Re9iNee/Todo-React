const normalizeQueryString = (queryString, filters) => {
    for (let property in filters) {
        const filterValue = filters[property];
        if (filterValue != undefined || filterValue != null) {
            if (typeof filterValue !== "string")
                queryString += ` AND ${property}=${filterValue}`;
            else
                queryString += ` AND ${property}=N'${filterValue}'`;
        }
    }
    return queryString;
};
const toHex = int => int.toString(16);
const toInt = hex => parseInt(hex, 16);

const addZero = (number, length) => {
    number = String(number).split('');
    while (number.length < length) {
        number.unshift(0);
    }
    number = number.join('');
    return number;
}

require("dotenv").config({
    path: "./utils/.env"
});
const {
    DB_DATABASE
} = process.env

const checkForeignKey = async (connection, parentTable, idValue) => {
    const {
        pool,
        poolConnect
    } = connection;
    // ensures that the pool has been created
    await poolConnect;
    const dependencies = await outputDependencies(connection, parentTable);
    for (let {
            TableName: table,
            ColName: column
        } of dependencies) {
        // for query filtering
        let filters = {};
        filters[column] = idValue;

        let queryString = `SELECT TOP (1) [${column}]
        FROM [${DB_DATABASE}].[dbo].[${table}]
        WHERE 1=1`
        queryString = normalizeQueryString(queryString, filters);
        try {
            const request = pool.request();
            const result = await request.query(queryString);
            const canRemove = !result.recordset.length;
            if (!canRemove)
                throw new Error(`This Foreign key depends on ${table} table ${column} column, and can not be removed`)
        } catch (err) {
            console.error("SQL error: ", err);
            return false;
        }
    }
    return true;
}

const outputDependencies = async (connection, table) => {
    const {
        poolConnect,
        pool
    } = connection;
    await poolConnect;
    let queryString = `SELECT 
    OBJECT_NAME(f.parent_object_id) TableName,
    COL_NAME(fc.parent_object_id,fc.parent_column_id) ColName
 FROM 
    sys.foreign_keys AS f
 INNER JOIN 
    sys.foreign_key_columns AS fc 
       ON f.OBJECT_ID = fc.constraint_object_id
 INNER JOIN 
    sys.tables t 
       ON t.OBJECT_ID = fc.referenced_object_id
 WHERE 
    OBJECT_NAME (f.referenced_object_id) = '${table}'`
    try {
        const request = pool.request();
        const result = await request.query(queryString);
        return [...result.recordset];
    } catch (err) {
        console.error("SQL error: ", err);
        return false;
    }
}

const setToQueryString = (queryString, newValues) => {
    // queryString = 'UPDATE ... SET '
    // newValues = {sth: 2, test: 3}
    // returns: Update ... SET sth = 2, test = 3
    let objEntries = Object.entries(newValues);
    for (const [i, [property, value]] of objEntries.entries()) {
        if (i == 0)
            queryString += ` ${property} = ${(typeof value == "string") ? "N" : " "}'${value}'`
        else if (i < objEntries.length)
            queryString += `, ${property} = ${(typeof value == "string") ? "N" : " "}'${value}'`
    }
    return queryString;
}


const validateNationalCode = str => {
    // Source: https://ab-bellona.ir/portal/algorithm-detection-accuracy-code-national-iran/
    let arr = str.split('');
    arr.reverse()
    let controlFigure = arr.splice(0, 1)[0];
    let accumulated = arr.reduce((acc, currentValue, currentIndex) => acc + (currentValue * (currentIndex + 2)), 0);

    // baghi mande 
    let remainder = accumulated % 11;
    if (remainder >= 2) {
        return 11 - remainder == controlFigure;
    } else {
        return controlFigure == remainder;
    }
}

// normalizeQS_Create => (queryString, {planName: "sth"}, ...configs)
// configs are the exceptions that don't have normal values. (need to convert or something to insert into SQL Server)
// configs = {onColumn: "EXCEPTION COLUMN", prefix="e.g: CONVERT(INT, $1)"}
const normalizeQueryString_Create = (queryString, details, ...configs) => {
    // queryString = INSERT INTO [table]
    // configs are for the columns that its value needs convert or some other expressions needed for SQLServer.
    // e.g: configs = [{onColumn: "ICON", prefix="CONVERT(varbinary, '$1')}]
    // will return: INSERT INTO [table] (column) VALUES (data);
    let columns = new Array();
    let values = new Array();


    if (configs) {
        // loop through special columns
        for (let [index, {
                onColumn: column,
                prefix
            }] of configs.entries()) {
            let rawValue = details[column];
            // if value doesn't exist skip this column exception
            if (rawValue == undefined || rawValue == null) continue
            columns.push(column)
            values.push(prefix.replace('$1', rawValue))
            // delete added index from details, avoid duplicates in QString
            delete details.column;
        }
    }
    for (let column in details) {
        columns.push(column);
        let value = details[column];
        if (typeof value == "string") {
            values.push(`N'${value}'`);
        } else {
            values.push(value);
        }
    }
    queryString = queryString.replace("$COLUMN", columns.join(', '))
    queryString = queryString.replace("$VALUE", values.join(', '));

    return queryString;
}


const checkDuplicate = async (connection, column, loadingMethod) => {
    let result = await loadingMethod(connection, column, null, 1);
    // 0 -> unique 
    // 1 -> duplicate
    let duplicate = !(!result.recordset.length);
    return duplicate;
}

const sqlDate = function ([year, month, day]) {
    this.year = year;
    this.month = month;
    this.day = day;
}

const endIsLenghty = (start, end) => (end.year > start.year) ? true : (end.year == start.year) ? (end.month > start.month) ? true : (end.month == start.month) ? (end.day >= start.day) ? true : false : false : false;

const NotNullColumnsFilled = (obj, ...columns) => {
    // returns true if all columns entered.
    let keys = Object.keys(obj);
    for (let column of columns) {
        if (!(keys.includes(column))) {
            return false
        }
    }
    return true;
}

module.exports = {
    normalizeQueryString,
    toHex,
    toInt,
    addZero,
    checkForeignKey,
    setToQueryString,
    validateNationalCode,
    normalizeQueryString_Create,
    checkDuplicate,
    sqlDate,
    endIsLenghty,
    NotNullColumnsFilled,
}