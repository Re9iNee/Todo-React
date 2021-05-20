const {
    ws_loadCashAssistanceDetail,
    ws_createCashAssistanceDetail,
    ws_updateCashAssistanceDetail,
    ws_deleteCashAssistanceDetail
} = require("../services/cashAssistanceDetail");
const {
    poolConnect,
    pool
} = require('../utils/charityDb');



exports.getCashAssistanceDetail = async (req, res) => {
    let query = req.query;
    // T09 - Method 01
    // path = /cashAssistanceDetail/?AssignNeedyPlanId=1&PlanId=1&CashAssistanceDetailId=1
    const result = await ws_loadCashAssistanceDetail({
        pool,
        poolConnect
    }, {
        AssignNeedyPlanId: query.AssignNeedyPlanId,
        PlanId: query.PlanId,
        CashAssistanceDetailId: query.CashAssistanceDetailId
    });
    // Easier way to send request is to send query object itself, but when it comes to typo it throws an error
    res.send({
        result
    })
}

exports.postCashAssistanceDetail = async (req, res) => {
    // T09 - Method 02 
    // Attach params to body as an JSON Format
    const result = await ws_createCashAssistanceDetail({
        pool,
        poolConnect
    }, req.body);
    // sending req.body directly causing program more error prone base on a typo, we will deconstruct object in that method.
    res.send({
        result
    });
}

exports.updateCashAssistanceDetail = async (req, res) => {
    // T09 - Method 03
    // Attach filters object and newValues to request body
    // parameters sql connection, filters, newValues
    // returns cashAssistanceDetail table
    const result = await ws_updateCashAssistanceDetail({
        pool,
        poolConnect
    }, req.body.filters, req.body.newValues);
    res.send({
        result
    });
}

exports.deleteCashAssistanceDetail = async (req, res) => {
    // T09 - Method 04
    // parameters: sql conneciton, cashAssistanceDetailId
    const result = await ws_deleteCashAssistanceDetail({
        pool,
        poolConnect
    }, req.body.cashAssistanceDetailId);
    res.send({
        result
    })
}