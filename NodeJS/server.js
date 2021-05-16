// TODO: add dotenv
const express = require("express")
const app = express();
const port = 8080;
const fs = require("fs")
// NOTE: headers: GET POST PUT PATCH DELETE COPY HEAD OPTIONS LINK UNLINK PURGE LOCK UNLOCK PROPFIND VIEW


// TODO: Connect to MongoDB Clusters
// TODO: Create Mongo Database

// TODO: Categories
// TODO: Create -> new Category.JSON file
// TODO: Read -> load all Category.JSON files - will display at the sidebar
// TODO: in loading method -> WHERE DELETED = false.
// TODO: Update -> renaming a specific Category.JSON file
// TODO: Delete -> removing a specific Category.JSON file (or renaming its file extension to use it later)


// TODO: Tasks
// TODO: Create -> insert a task into an specific Category.JSON file
// TODO: Read -> load all task from an specific Category.JSON file
// TODO: Update -> 1. renaming  / 2. add2Fav / 3. markAsDone
// TODO: DELETE -> remove a task from specific Category.JSON file 
app.listen(port, () => console.log(`Server is running on port ${port}`));