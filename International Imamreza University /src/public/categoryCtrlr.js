app.controller('categoryCtrlr', async ($scope, $location) => {
    // NOTE: AngularJS, Front-end Logic
    $scope.sideBarHeader = "Lists";

    // NOTE: App Navigation / Routes
    $scope.navigateTo = (category) => {
        $location.url(`/category/${category.title}/id/${category.categoryId}`);
        //TODO: If we could send an object to task controller use category.title for url location.
    }


    // NOTE: DATABASE, CRUD, BackEnd Logics
    const categoryDB = new CRUD(URL, "category");

    // Create
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
        // NOTE: Add to angualarJS array of object
        // NOTE: if we want to relaod the page it would load all categories again
        $scope.categories.push(...insertedRow);
        $scope.newCategoryName = '';
        $scope.$apply();
    }

    // Read
    $scope.categories = await categoryDB.read();
    // telling anuglarJS to refresh
    $scope.$apply();

    // Update
    $scope.update = async (id, checked) => {
        // TODO: this only works if you wanna mark items as checked. for later features you should modify this method for more flexibility.
        const updateResult = await categoryDB.update({
            categoryId: id
        }, {
            checked
        });
    }

    // Delete
    $scope.delete = async (index, id) => {
        // first delete it from local array (front)
        $scope.categories.splice(index, 1);
        // then deleting from database
        const deleteResult = await categoryDB.delete({
            categoryId: id
        });
    }



    // STUB: DEBUGGING SECTION
    $scope.debug = (param) => {
        console.log(param)
    }

});