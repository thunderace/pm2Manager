var app = angular.module("PM2Manager.directive", []);

app.directive('proccessList', ['$http','$templateCache','$compile',function ($http,$templateCache,$compile) {
    return {
        link: function (scope, element, attrs) {
			$http.get('partials/proccesslist.html').success(function (response) {
				var el = $compile(response)(scope);
			});
        }
    };
}]);

