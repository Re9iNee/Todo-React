app.controller('categoryCtrlr', async ($scope) => {
    // NOTE: AngularJS, Front-end Logic
    $scope.sideBarHeader = "Lists";


    // NOTE: DATABASE, CRUD, BackEnd Logics
    const categoryDB = new CRUD(URL, "category");

    // Read
    $scope.categories = await categoryDB.read();
    // telling anuglarJS to refresh
    $scope.$apply();

    // Delete
    $scope.delete = async (index, id) => {
        // first delete it from local array (front)
        $scope.categories.splice(index, 1);
        // then deleting from database
        const deleteResult = await categoryDB.delete({
            categoryId: id
        });
    }

    // Update
    $scope.update = async (id, checked) => {
        const updateResult = await categoryDB.update({
            categoryId: id
        }, {
            checked
        });
    }


    // STUB: DEBUGGING SECTION
    $scope.debug = (param) => {
        console.log(param)
    }

});