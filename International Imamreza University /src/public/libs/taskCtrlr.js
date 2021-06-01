app.controller('taskCtrlr', ($scope, $interval) => {
    // Init:
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
    $scope.taskLists = $scope.getSavedList(dbName);
    $scope.addTask = (title) => {
        if (!title) return
        $scope.taskLists.push({
            title: title,
            checked: false,
            favourite: false,
            created: Date.now(),
            $$hashKey: `object:${String(Date.now())+String($scope.taskLists.length)+String(Math.random())}`,
        })
        $scope.saveList(dbName, $scope.taskLists);
        $scope.taskName = "";
    }
    $scope.deleteTask = (hashKey) => {
        for (const [i, v] of $scope.taskLists.entries()) {
            if (v.$$hashKey == hashKey) {
                $scope.taskLists.splice(i, 1);
            }
        }
        $scope.saveList(dbName, $scope.taskLists);
    }
})