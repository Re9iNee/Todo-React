const express = require("express");
const dotEnv = require("dotenv");
const bodyPaser = require('body-parser');
const path = require('path');

// const cashAssistanceDetailRouter = require("./router/cashAssistanceDetail");






// config

dotEnv.config({
    path: "./utils/.env"
});
const port = process.env.PORT || 8080;


// express

const app = express();


// static folder
app.use(express.static(path.join(__dirname, "public")));


//bodyParser

app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({
    extended: false
}));



app.use(express.json({
    limit: '1mb'
}));



/*  TASK 9 */

// app.use(cashAssistanceDetailRouter)



/* ----  Testing Area: ----- */
const {
    pool,
    poolConnect
} = require("./utils/charityDb");
(async () => {})();
/* -----  End of Testing Area ---- */

app.listen(port, () => console.log(`Listening on ${port}`));
