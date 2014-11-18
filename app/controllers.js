angular.module('PM2Manager.controllers', [])
    .controller('ChartCtrl', ['$scope','socket','$filter','tools', function ($scope,socket,$filter,tools) {
        $scope.processes = new Array();
        $scope.pm2Servers = new Array();
        
        socket.on('server_down', function (ip) {
        	removeServerEntry(ip);
        	removeServerProcesses(ip);
            	
        });
        socket.on('error', function (data) {
        	// remove all screen data
        	$scope.processes = new Array();
	        $scope.pm2Servers = new Array();
        });

        socket.on('watchPm2', function (server) {
            var appMem = 0;
			var uptime = toHHMMSS(server.system_info.uptime);
			server.system_info.uptime = uptime;
			
            var totalMem = server.monit.total_mem;

            angular.forEach(server.processes, function (v, k) {
                appMem += parseInt(v.monit.memory);
                v.memprecent = $filter('itempercent')(v.monit.memory,totalMem);
                v.hostname = server.system_info.hostname;
                v.hostIP = server.system_info.ip;
                v.pm_id = server.pm_id;
                addOrUpdateProcessEntry(v);
                /*
                if (!$scope.processes[v.name + '-' + v.hostname  + '-' + server.pm_id]) {
                	$scope.processes[v.name + '-' + v.hostname  + '-' + server.pm_id] = {};
                }
                
                $scope.processes[v.name + '-' + v.hostname + '-' + server.pm_id] = v;
                */
            });

            server.appMem = appMem;
            server.Mempercent = $filter('percent')(server.monit.free_mem,totalMem);
            server.appMempercent = $filter('itempercent')(server.appMem,totalMem);
            addOrUpdateServerEntry(server);
/*            
			if (!$scope.pm2Servers[server.system_info.hostname]) {
				$scope.pm2Servers[server.system_info.hostname] = {};
			}
			$scope.pm2Servers[server.system_info.hostname] = server;
*/			
        });

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });

        $scope.stop = function (pm2id) {
        	console.log(pm2id);
        	socket.emit('message', {command: 'stop', pm2id: pm2id});
        };
        $scope.start = function (pm2id) {
        	console.log(pm2id);
        	socket.emit('message', {command: 'start', pm2id: pm2id});
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
		    		return;
		    	}
		    }
			$scope.processes.push(process2Add);
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
			for (var index = 0; index < $scope.processes.length; index++) {
		    	if ($scope.processes[index].hostIP == ip ){
		    		$scope.processes.splice(index, 1);
		    	}
		    }
		};
/*		
		removeProcessesEntries = function(ip) {
			for (var index = 0; index < $scope.pm2Servers.length; index++) {
		    	if ($scope.pm2Servers[index].system_info.ip == ip) {
		    		$scope.pm2Servers.splice(index, 1);
		    		return;
		    	}
		    }
		    console.log ('server to remove not found');
		};
*/
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