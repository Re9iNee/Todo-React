const sql = require("mssql");
require("dotenv").config({
    path: "./utils/.env"
});
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    "options": {
        "encrypt": true,
        "enableArithAbort": true
    }
};

const pool = new sql.ConnectionPool(config);


const poolConnect = pool.connect();


pool.on("error", err => {
    console.log("Could not Connect to the Database", err);
});

module.exports = {
    pool,
    poolConnect
}