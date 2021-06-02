app.controller('taskCtrlr', function ($scope, $http, $routeParams) {
    // Init:
    const {
        title: categoryTitle,
        id: categoryId
    } = $routeParams;
    $scope.categoryTitle = categoryTitle;
    // TODO: type check
    const dbName = 'list5';
    $scope.searchMode = false;
    $scope.appState = 0;
    $scope.tempHash = null;
    $scope.changeTaskName = (to, hashKey) => {
        $scope.tempHash = hashKey;
        $scope.taskName = String(to);
        $scope.focusOnInput();
    }
    $scope.focusOnInput = () => {
        document.getElementById("my-input").focus();
    }
    $scope.submitForm = (taskName) => {
        // appState: 0 -> add || 1-> editMode || 2 -> searchMode 
        switch ($scope.appState) {
            case 0: {
                $scope.addTask(taskName)
                break;
            }
            case 1: {
                for (let v of $scope.taskLists) {
                    if (!$scope.tempHash) return
                    if (v.$$hashKey == $scope.tempHash) {
                        v.title = taskName;
                        $scope.taskName = "";
                        $scope.changeAppState(0);
                    }
                }
                $scope.saveList(dbName, $scope.taskLists);
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
        const id = await create(title);
        const insertedRow = await taskDB.read({
            taskId: id
        });
        // NOTE: Add to angularJS array of object
        $scope.taskLists.push(...insertedRow);
        $scope.$apply();
        $scope.taskName = '';
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
})