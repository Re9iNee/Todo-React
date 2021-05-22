const express = require("express");
const dotEnv = require("dotenv");
const bodyPaser = require('body-parser');
const path = require('path');

const categoryRoutes = require("./router/category");


// NOTE: headers: GET POST PUT PATCH DELETE COPY HEAD OPTIONS LINK UNLINK PURGE LOCK UNLOCK PROPFIND VIEW


// TODO: Connect to MSSQL Clusters

// TODO: Categories
// TODO: Create -> new Category.JSON file
// TODO: display all categories at the sidebar
// TODO: in loading method -> WHERE DELETED = false.
// TODO: Update -> renaming a specific Category.JSON file
// TODO: Delete -> removing a specific Category.JSON file (or renaming its file extension to use it later)


// TODO: Tasks
// TODO: Create -> insert a task into an specific Category.JSON file
// TODO: Read -> load all task from an specific Category.JSON file
// TODO: Update -> 1. renaming  / 2. add2Fav / 3. markAsDone
// TODO: DELETE -> remove a task from specific Category.JSON file 



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



/*  TASK 1 */

app.use(categoryRoutes);




/* ----  Testing Area: ----- */
const {
    pool,
    poolConnect
} = require("./utils/todoDB");
const {
    ws_loadCategory,
} = require("./services/category");

(async () => {

})();
/* -----  End of Testing Area ---- */

app.listen(port, () => console.log(`Listening on ${port}`));
