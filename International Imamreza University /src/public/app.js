let app = angular.module('myApp', ['ngAnimate', 'ngRoute'])


app.config(function ($routeProvider) {
    $routeProvider
        .when("/category/:title/id/:categoryId", {
            templateUrl: "task.html",
            controller: "taskCtrlr"
        })
        .otherwise("/category/Today/id/1")
});