angular.module('PM2Manager.controllers', [])
    .controller('ChartCtrl', ['$scope','socket','$filter','tools', function ($scope,socket,$filter,tools) {
        $scope.processes = [];
        $scope.pm2Servers = [];
        
        socket.on('server_down', function (ip) {
			removeServerEntry(ip);
			removeServerProcesses(ip);
        });
        socket.on('error', function (data) {
			// remove all screen data
			$scope.processes = [];
			$scope.pm2Servers = [];
        });

        socket.on('watchPm2', function (server) {
			server.system_info.uptime = toHHMMSS(server.system_info.uptime);
            var totalMem = server.monit.total_mem;
            var appMem = 0;
            var oldServer = getServerEntry(server.system_info.hostname);
            if (oldServer != null && oldServer.processes.length != server.processes.length) {
				// not the same process count : remove all and again    
				removeServerProcesses(server.system_info.ip);
            }
            angular.forEach(server.processes, function (v, k) {
                appMem += parseInt(v.monit.memory,10);
                v.memprecent = $filter('itempercent')(v.monit.memory,totalMem);
                v.hostname = server.system_info.hostname;
                v.hostIP = server.system_info.ip;
                v.pm_id = server.pm_id;
                v.stopStart = server.system_info.extHttpInterface;
				addOrUpdateProcessEntry(v);
            });
            server.appMem = appMem;
            server.Mempercent = $filter('percent')(server.monit.free_mem,totalMem);
            server.appMempercent = $filter('itempercent')(server.appMem,totalMem);
            addOrUpdateServerEntry(server);
        });

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });

        $scope.stopstart = function (status, pm2id, hostIP, e) {
        	if (status == 'online') {
				socket.emit('message', {command: 'stop', pm2id: pm2id, ip: hostIP});
        	} else {
				socket.emit('message', {command: 'restart', pm2id: pm2id, ip: hostIP});
        	}
			// disable button
			var element = angular.element(e.srcElement);
			element.attr("disabled", "disabled");
        };

		getServerEntry = function(hostname) {
			for (var index = 0; index < $scope.pm2Servers.length; index++) {
				if ($scope.pm2Servers[index].system_info.hostname == hostname) {
					return $scope.pm2Servers[index];
				}
			}
			return null;
		};
		addOrUpdateServerEntry = function(server2Add) {
			for (var index = 0; index < $scope.pm2Servers.length; index++) {
				if ($scope.pm2Servers[index].system_info.hostname == server2Add.system_info.hostname) {
					$scope.pm2Servers[index] = server2Add;
					return;
				}
			}
			$scope.pm2Servers.push(server2Add);
		};
		addOrUpdateProcessEntry = function(process2Add) {
			for (var index = 0; index < $scope.processes.length; index++) {
				if ($scope.processes[index].name == process2Add.name && $scope.processes[index].hostname == process2Add.hostname && $scope.processes[index].pm_id == process2Add.pm_id ){
					$scope.processes[index] = process2Add;
					return 0; // update
				}
			}
			$scope.processes.push(process2Add);
			return 1; // new entry
		};
		removeServerEntry = function(ip) {
			for (var index = 0; index < $scope.pm2Servers.length; index++) {
				if ($scope.pm2Servers[index].system_info.ip == ip) {
					$scope.pm2Servers.splice(index, 1);
					return;
				}
			}
			console.log ('server to remove not found');
		};
		removeServerProcesses = function(ip) {
			for (var index = $scope.processes.length -1; index >= 0; index--) {
				if ($scope.processes[index].hostIP == ip ){
					$scope.processes.splice(index, 1);
				}
			}
		};
}]);
    


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