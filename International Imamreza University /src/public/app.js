let app = angular.module('myApp', ['ngAnimate', 'ngRoute'])


app.config(function ($routeProvider) {
    $routeProvider
        .when("/category/Today/id/1", {
            templateUrl: "task.html",
            controller: "taskCtrlr"
        })
        .when("/CategoryTitle/:title/id/:categoryId", {
            templateUrl: "task.html",
            controller: "taskCtrlr"
        })
        .otherwise("/category/Today/id/1")
});