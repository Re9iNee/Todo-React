app.controller('taskCtrlr', function ($scope, $http, $routeParams) {
    // Init:
    const {
        title: categoryTitle,
        id: categoryId
    } = $routeParams;
    $scope.categoryTitle = categoryTitle;
    // TODO: type check
    $scope.searchMode = false;
    $scope.appState = 0;
    $scope.tempTaskId = null;
    $scope.changeTaskName = (from, id) => {
        $scope.tempTaskId = id;
        $scope.taskName = String(from);
        $scope.focusOnInput();
    }
    $scope.focusOnInput = () => {
        document.getElementById("my-input").focus();
    }
    $scope.submitForm = async (taskName) => {
        // appState: 0 -> add || 1-> editMode || 2 -> searchMode 
        switch ($scope.appState) {
            case 0: {
                $scope.addTask(taskName)
                break;
            }
            case 1: {
                const updateResult = await $scope.update($scope.tempTaskId, {
                    title: taskName
                });
                if (updateResult.status != "Failed")
                    for (let v of $scope.taskLists) {
                        if (!$scope.tempTaskId) return
                        if (v.taskId == $scope.tempTaskId) {
                            v.title = taskName;
                        }
                    }
                // TODO: if update is a failed. show the result to User (UX)
                $scope.taskName = "";
                $scope.changeAppState(0);
                $scope.$apply();
                break;
            }
            case 2: {
                $scope.changeSearch(taskName)
                break;
            }
        }
    }
    $scope.svgSwitch = () => {
        switch ($scope.appState) {
            case 1: {
                $scope.changeAppState(0);
                $scope.taskName = "";
                break;
            }
            case 0: {
                $scope.changeAppState(2);
                break;
            }
            case 2: {
                $scope.changeAppState(0);
                $scope.taskName = "";
                break;
            }
            default: {
                $scope.changeAppState(0)
                $scope.taskName = "";
                break;
            }
        }
    }
    $scope.changeAppState = (to) => {
        $scope.appState = Number(to)
        switch (to) {
            case 0: {
                $scope.inputPlaceHolder = "Add Items"
                $scope.svgTitle = "Search"
                break;
            }
            case 1: {
                $scope.inputPlaceHolder = "Editing";
                $scope.svgTitle = "Close"
                break;
            }
            case 2: {
                $scope.inputPlaceHolder = "Search ..."
                $scope.svgTitle = "Add"
                break;
            }
        }
    }
    $scope.changeAppState(0);
    $scope.onInputChange = (taskName) => {
        switch ($scope.appState) {
            case 2: {
                $scope.changeSearch(taskName)
                break;
            }
            default: {
                $scope.clearSearchTerm()
                break;
            }
        }
    }
    $scope.changeSearch = (input) => {
        $scope.searchTerm = input;
    }
    $scope.clearSearchTerm = () => {
        $scope.searchTerm = '';
    }
    $scope.stopPropagation = (event) => {
        event.stopPropagation();
    }
    $scope.getSavedList = (id) => {
        let str = localStorage.getItem(id);
        return str ? JSON.parse(str) : new Array();
    }
    $scope.saveList = (id, value) => {
        try {
            localStorage.setItem(id, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }
    $scope.save = () => {
        $scope.saveList(dbName, $scope.taskLists);
    }
    // DATABASE, CRUD, BackEnd Logics
    // Read
    const taskDB = new CRUD(URL, "task");
    $http.get(`${URL}/task/?categoryId=${Number(categoryId)}`).then(resp => {
        const result = resp.data.result.recordset;
        $scope.taskLists = result.slice();
    })
    // Create
    $scope.addTask = async (title) => {
        if (!title) return
        // TODO: Validation
        const create = async (title) => {
            const result = await taskDB.create({
                title,
                categoryId
            })
            return result;
        }
        const result = await create(title);
        if (typeof result == "number") {
            const insertedRow = await taskDB.read({
                taskId: result
            });
            // NOTE: Add to angularJS array of object
            $scope.taskLists.push(...insertedRow);
            $scope.taskName = '';
            $scope.$apply();
        }
        else if (result.status == "Failed"){
            // TODO: Send an error message to user telling him its wrong.
        }
    }
    // Delete
    $scope.deleteTask = async (index, id) => {
        // first delete it from local array (front)
        $scope.taskLists.splice(index, 1);
        // then deleting from database
        const deleteResult = await taskDB.delete({
            taskId: id
        });
    }
    // Update
    $scope.update = async (id, vals) => {
        const updateResult = await taskDB.update({
            taskId: id
        }, vals);
        return updateResult;
    }
})