const {
    normalizeQueryString,
    checkDuplicate,
    normalizeQueryString_Create,
} = require("../utils/commonModules");


require("dotenv").config({
    path: "./utils/.env"
});
const {
    DB_DATABASE
} = process.env

const ws_loadCashAssistanceDetail = async (connection, filters = new Object(null), customQuery = null, resultLimit = 1000) => {
    // in older version of this code. filters object hadn't any default value - Issue #42 - filters object should not be empty
    const {
        pool,
        poolConnect
    } = connection;
    // ensures that the pool has been created
    await poolConnect;
    let queryString = `SELECT TOP (1000) [CashAssistanceDetailId]
    ,cashAssist.[AssignNeedyPlanId]
    ,cashAssist.[PlanId]
    ,[NeededPrice]
    ,[MinPrice]
    ,cashAssist.[Description] as "Cash Assist Description"
    ,[NeedyId]
    ,assignNeedy.[Fdate]
    ,assignNeedy.[Tdate]
    ,[PersonId]
    ,[Name]
    ,[Family]
    ,[NationalCode]
    ,[SecretCode]
    ,[PlanName]
    ,plans.[Description] as "Plans Description"
    ,[PlanNature]
    ,[ParentPlanId]
    FROM [${DB_DATABASE}].[dbo].[tblCashAssistanceDetail] as cashAssist 
    INNER JOIN [${DB_DATABASE}].[dbo].[tblPlans] as plans
    on cashAssist.PlanId = plans.PlanId
    LEFT JOIN [${DB_DATABASE}].[dbo].[tblAssignNeedyToPlans] as assignNeedy
    on cashAssist.AssignNeedyPlanId = assignNeedy.AssignNeedyPlanId
    LEFT JOIN [${DB_DATABASE}].[dbo].[tblPersonal] as personal
    on assignNeedy.NeedyId = personal.PersonId
    WHERE 1 = 1 `;
    // Ambiguous column names problem
    if ("PlanId" in filters) {
        filters["plans.PlanId"] = filters.PlanId;
        delete filters.PlanId;
    }
    if ("AssignNeedyPlanId" in filters) {
        filters["cashAssist.AssignNeedyPlanId"] = filters.AssignNeedyPlanId;
        delete filters.AssignNeedyPlanId;
    }

    queryString = normalizeQueryString(queryString, filters);
    if (customQuery)
        queryString += ` ${customQuery}`;

    try {
        const request = pool.request();
        const result = await request.query(queryString);
        console.dir(result);
        return result;
    } catch (err) {
        console.error("SQL error: ", err);
    }
}




const ws_createCashAssistanceDetail = async (connection, details) => {
    // details are the parameters sent for creating table
    const {
        AssignNeedyPlanId,
        PlanId,
        NeededPrice,
        MinPrice,
        Description
    } = details;

    // Not Null Values
    if (!("PlanId" in details) || !("NeededPrice" in details))
        return {
            status: "FAILED",
            msg: "Fill Parameters Utterly.",
            details,
            notNullValues: ["PlanId", "NeededPrice"]
        }





    // check for duplicates (check for unique columns)
    // AssignNeedyPlanId and PlanId are unqiue values
    const duplicateUniqueValue = await checkDuplicate(connection, {
        AssignNeedyPlanId,
        PlanId
    }, ws_loadCashAssistanceDetail);
    if (duplicateUniqueValue)
        return {
            status: "Failed",
            msg: "Error Creating Row, Violation of unique values",
            uniqueColumn: "AssignNeedyPlanId, PlanId",
            details
        }
    // BUG: Issue #41

    // check for any column custome validations
    // MinPrice should be less or equal than NeededPrice
    if (MinPrice > NeededPrice)
        return {
            status: "Failed",
            msg: "Error Creating Row, NeededPrice should be greater than MinPrice",
            details
        }


    const {
        pool,
        poolConnect
    } = connection;
    // ensures that the pool has been created
    await poolConnect;

    let queryString = `INSERT INTO 
        [${DB_DATABASE}].[dbo].[tblCashAssistanceDetail] 
        ($COLUMN)
        VALUES ($VALUE);
        SELECT SCOPE_IDENTITY() AS cashAssistanceDetailId;`
    // normalizeQS_Cretate => (queryString, {PlanId: "sth"}, ...configs)
    queryString = normalizeQueryString_Create(queryString, details);

    try {
        const request = pool.request();
        const result = await request.query(queryString);
        const id = result.recordset[0].cashAssistanceDetailId;
        return id;
    } catch (err) {
        console.error("ws_createCashAssistanceDetail error: ", err);
    }
}

// NOTE Bulk Updating is disbaled on this table
const ws_updateCashAssistanceDetail = async (connection, filters, newValues) => {
    // inputs and params
    const {
        AssignNeedyPlanId,
        PlanId,
        NeededPrice,
        MinPrice,
        Description
    } = newValues;
    // MinPrice should be less or equal than NeededPrice
    if (MinPrice > NeededPrice)
        return {
            status: "Failed",
            msg: "Error Updating Row, NeededPrice should be either bigger or equal, than MinPrice",
            newValues
        }

    // NOTE Fix #41
    async function checkForCashAssistDuplicate(PlanId, AssignNeedyPlanId) {
        const duplicateUniqueValue = await checkDuplicate(connection, {
            AssignNeedyPlanId,
            PlanId
        }, ws_loadCashAssistanceDetail);
        return duplicateUniqueValue;
    }
    let uniqueViolation = null;
    if ("AssignNeedyPlanId" in newValues && "PlanId" in newValues) {
        // AssignNeedyPlanId and PlanId are unqiue values
        //check for unqiue values if both have entered.
        uniqueViolation = await checkForCashAssistDuplicate(PlanId, AssignNeedyPlanId)
    } else if ("AssignNeedyPlanId" in newValues || "PlanId" in newValues) {
        //check for unqiue values if either have entered.
        let filteredRow = await ws_loadCashAssistanceDetail(connection, filters);
        if ("AssignNeedyPlanId" in newValues) {
            const PlanId = filteredRow.recordset[0].PlanId;
            uniqueViolation = await checkForCashAssistDuplicate(PlanId, AssignNeedyPlanId)
        } else if ("PlanId" in newValues) {
            const AssignNeedyPlanId = filteredRow.recordset[0].AssignNeedyPlanId;
            uniqueViolation = await checkForCashAssistDuplicate(PlanId, AssignNeedyPlanId)
        }
    }
    if (uniqueViolation)
        return {
            status: "Failed",
            msg: "Error Updating Row, Violation of unique values",
            uniqueColumn: "AssignNeedyPlanId, PlanId",
            newValues
        }


    // if CashAssistanceDetailId is available on tblPayment we can not change MinPrice AND NeededPrice
    if ("MinPrice" in newValues || "NeededPrice" in newValues) {
        const {
            ws_loadPayment
        } = require("./payment");
        // get the cashAssistanceDetailId base on the entered filters object.
        const result = await ws_loadCashAssistanceDetail(connection, filters, "ORDER BY CashAssistanceDetailId ");
        for (let record of result.recordset) {
            // check for duplicate on dependent tables. if it doesn't conflict with payment table -> UPDATE
            let CashAssistanceDetailId = record.CashAssistanceDetailId;
            let cashAssistIdExist = await checkDuplicate(connection, {
                CashAssistanceDetailId
            }, ws_loadPayment);
            if (cashAssistIdExist)
                return {
                    status: "Failed",
                    msg: "Error Updating Row, Can not change MinPrice NOR NeededPrice columns if cashAssistanceDetailId Exists on tblPayment",
                    dependencies: ["tblPayment"],
                    CashAssistanceDetailId
                }
        }
    }

    queryString = `UPDATE [${DB_DATABASE}].[dbo].[tblCashAssistanceDetail] 
    SET `;
    const {
        setToQueryString
    } = require("../utils/commonModules");
    // setToQueryString returns: Update ... SET sth = 2, test = 3
    queryString = setToQueryString(queryString, newValues) + " WHERE 1=1 ";
    queryString = normalizeQueryString(queryString, filters);

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
        const table = await ws_loadCashAssistanceDetail(connection);
        return table;
    } catch (err) {
        console.error("ws_updateCashAssistanceDetail SQL erorr: ", err);
    }
}

const ws_deleteCashAssistanceDetail = async (connection, cashAssistanceDetailId) => {
    // if cashAssistancedDetailId exists on => tblPayment we can not delete that row.
    const {
        checkForeignKey
    } = require("../utils/commonModules");
    const canRemove = await checkForeignKey(connection, "tblCashAssistanceDetail", cashAssistanceDetailId);
    if (!canRemove)
        return {
            status: "Failed",
            msg: "Can not remove this ID",
            cashAssistanceDetailId,
            dependency: "tblPayment"
        }

    const {
        pool,
        poolConnect
    } = connection;
    // ensures that the pool has been created
    await poolConnect;
    let queryString = `DELETE [${DB_DATABASE}].[dbo].[tblCashAssistanceDetail] WHERE CashAssistanceDetailId = ${cashAssistanceDetailId};`;
    try {
        const request = pool.request();
        const deleteResult = await request.query(queryString);
        const table = await ws_loadCashAssistanceDetail(connection);
        return table;
    } catch (err) {
        console.error("ws_deleteCashAssistanceDetail - SQL Error: ", err);
    }
}

module.exports = {
    ws_loadCashAssistanceDetail,
    ws_createCashAssistanceDetail,
    ws_updateCashAssistanceDetail,
    ws_deleteCashAssistanceDetail
}