let app = angular.module('myApp', ['ngAnimate'])
app.config(($routeProvider) => {
    $routeProvider
        .when("/category/:categoryTitle/id/:categoryId", {
            templateUrl: 'task.html',
            controller: 'taskCtrlr'
        })
})