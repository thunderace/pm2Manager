'use strict';
var CW = {};

angular.module('ie7support', []).config(function($sceProvider) {
// Completely disable SCE to support IE7.
    $sceProvider.enabled(false);
});


angular.module('PM2Manager', ['ngRoute','PM2Manager.controllers', 'PM2Manager.services', 'PM2Manager.filters','PM2Manager.directive','easypiechart','tools'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider

            .when('/', {
                templateUrl: 'partials/chart.html',
                controller: 'ChartCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .run(['$rootScope', '$route', '$http', function ($rootScope, $route, $http) {
        CW.socket=location.host;
        CW.scope = $rootScope;

        $rootScope.opt = [
            {barColor:'#FF530D', lineWidth:10 ,trackColor:'#888', lineCap:'round' ,scaleColor:false},
            {barColor:'#1F8A70',  lineWidth:10, trackColor:'#888',lineCap:'round' ,scaleColor:false},
            {barColor:'#FFFFFF', lineWidth:10, trackColor:'#888', lineCap:'round',scaleColor:false}
        ]


    }]);

angular.bootstrap(document, ['PM2Manager']);
