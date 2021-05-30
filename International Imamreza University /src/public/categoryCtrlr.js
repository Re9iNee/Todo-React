app.controller('categoryCtrlr', async ($scope) => {
    // NOTE: AngularJS, Front-end Logic
    $scope.sideBarHeader = "Lists";


    // NOTE: DATABASE, CRUD, BackEnd Logics
    const categoryDB = new CRUD(URL, "category");

    // Read
    $scope.categories = await categoryDB.read();
    // telling anuglarJS to refresh
    $scope.$apply();

    

});