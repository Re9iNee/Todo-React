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

    $scope.submit = async ($event) => {
        const title = $scope.categoryForm.newCatTitle.$$rawModelValue;
        // TODO: VALIDATION
        // NOTE: creating a row in databse
        const create = async (title) => {
            const result = await categoryDB.create({
                title
            });
            return result;
        };
        const id = await create(title);
        const insertedRow = await categoryDB.read({categoryId: id});
        // // NOTE: Add to angualarJS array of object
        // // NOTE: if we want to relaod the page it would load all categories again
        $scope.categories.push(...insertedRow);
        $scope.$apply();
        // TODO: clear input bar text
    }


    // STUB: DEBUGGING SECTION
    $scope.debug = (param) => {
        console.log(param)
    }

});