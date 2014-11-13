angular.module('VcoApp.controllers', [])

    .controller('ChartCtrl', ['$scope','socket','$filter','tools', function ($scope,socket,$filter,tools) {
        $scope.processes = [];
        socket.on('watchPm2', function (data) {
            var appMem = 0;
            $scope.data = data;

			var uptime = toHHMMSS($scope.data.system_info.uptime);
			$scope.data.system_info.uptime = uptime;
			
            var totalMem = $scope.data.monit.total_mem;

            angular.forEach(data.processes, function (v, k) {
                appMem += parseInt(v.monit.memory);
                v.memprecent = $filter('itempercent')(v.monit.memory,totalMem);
            });

            tools.union($scope.processes,data.processes);

            $scope.data.appMem = appMem;
            $scope.Mempercent = $filter('percent')($scope.data.monit.free_mem,totalMem);
            $scope.appMempercent = $filter('itempercent')($scope.data.appMem,totalMem);

        });

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        })
    }])
    
function toHHMMSS(value) {
	
    var sec_num = parseInt(value, 10); // don't forget the second param
	var days = Math.floor(sec_num / 86400);
	sec_num -= days * 86400;
	// calculate (and subtract) whole hours
	var hours = Math.floor(sec_num / 3600) % 24;
	sec_num -= hours * 3600;
	// calculate (and subtract) whole minutes
	var minutes = Math.floor(sec_num / 60) % 60;
	sec_num -= minutes * 60;
	// what's left is seconds
	var seconds = sec_num;

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = days + ' days, ' + hours+':'+minutes+':'+seconds;
    return time;
}