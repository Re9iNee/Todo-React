const express = require("express");
const dotEnv = require("dotenv");
const bodyPaser = require('body-parser');
const path = require('path');

const categoryRoutes = require("./router/category");
const taskRoutes = require("./router/task");


// NOTE: headers: GET POST PUT PATCH DELETE COPY HEAD OPTIONS LINK UNLINK PURGE LOCK UNLOCK PROPFIND VIEW



// FIXME: if you (soft)delete a row, you will have a problem with their unique columns for later insertions

// TODO: setup cors

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



/*  TASK 2 */

app.use(categoryRoutes);

/*  TASK 3 */

app.use(taskRoutes);



/* ----  Testing Area: ----- */
const {
    pool,
    poolConnect
} = require("./utils/todoDB");
(async () => {
    // STUB
})();
/* -----  End of Testing Area ---- */

app.listen(port, () => console.log(`Listening on ${port}`));
