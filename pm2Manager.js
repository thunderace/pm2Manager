var url = require('url');
var path = require('path');
var fs = require('fs');
var request = require('request');
var config = require('./config');

var app = require('http').createServer(handler).listen(config.httpPort);
var io = require('socket.io').listen(app,{log:false});

var basePath = path.dirname(process.argv[1]);
var serverStatus = {};
// Serve the index.html page
function handler (req, res) {
	var uri = url.parse(req.url).pathname;
	var filename = path.join(basePath, uri);

	var contentTypesByExtension = {
		'.html': "text/html",
		'.css':  "text/css",
		'.js':   "text/javascript"
	};

	fs.exists(filename, function(exists) {
		if(!exists) {
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("404 Not Found\n");
			res.end();
			return;
		}

		if (fs.statSync(filename).isDirectory()) {
			filename += '/index.html';
		}
	
		fs.readFile(filename, "binary", function(err, file) {
			if(err) {        
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write(err + "\n");
				res.end();
				return;
			}
	
			var headers = {};
			var contentType = contentTypesByExtension[path.extname(filename)];
			if (contentType) {
				headers["Content-Type"] = contentType;
			}
			res.writeHead(200, headers);
			res.write(file, "binary");
			res.end();
		});
	});
}


console.log('pm2Manager daemon started on http://localhost:' + config.httpPort);
	
function getPM2() {
	config.pm2Servers.forEach(function(server) {
		if (server.enable == undefined || server.enable == 1) {
			if (!serverStatus[server.ip]) {
				serverStatus[server.ip] = {};
				serverStatus[server.ip].online = 0;
				serverStatus[server.ip].port = server.port;
				// get the http interface version
				request({url:'http://' + server.ip + ':' + server.port + '/version', oauth:{}, json:true}, function (error, response, data) {
					if (!error && response.statusCode == 200) {
						console.log('PM2 server ' + server.ip + ' has extended HTTP interface');
						serverStatus[server.ip].extHttpInterface = 1;
					} else {
						console.log('PM2 server ' + server.ip + ' is down or has not extended HTTP interface');
						serverStatus[server.ip].extHttpInterface = 0;
					}
				});
			}
			request({url:'http://' + server.ip + ':' + server.port, oauth:{}, json:true}, function (error, response, data) {
				if (!error && response.statusCode == 200) {
					serverStatus[server.ip].online = 1;
					data.system_info.ip = server.ip;
					data.system_info.extHttpInterface = serverStatus[server.ip].extHttpInterface;
					io.emit('watchPm2',data);
				} else {
					if (serverStatus[server.ip].online == 1) {
						io.emit('server_down',server.ip);
					}
					serverStatus[server.ip].online = 0;
				}
			});
		}
	});
}

var clients = 0;
var intervalID;
io.on('connection', function (socket) {
	if (clients == 0) {
		intervalID = setInterval(getPM2,config.updateInterval);
		getPM2(); // initial call
	}
	clients++;
	socket.on('disconnect', function () {
		clients--;
		if (clients == 0) {
			clearInterval(intervalID);
		}
	});

	socket.on('message', function (data) {
		if (!data) {
			return;
		}
		if (data.command == 'restart' || data.command == 'stop') {
			if (!serverStatus[ip].extHttpInterface ||  serverStatus[ip].extHttpInterface == 0) {
				return;
			}
			var pm_id = data.pm2id;
			var ip = data.ip;
			request({url:'http://' + ip + ':' + serverStatus[ip].port + '/'+ data.command + '?pm_id=' + pm_id, oauth:{}, json:true}, function (error, response, data) {
			if (!error && response.statusCode == 200) {
				console.log(data);
			} else {
				console.log('error ' + error );
			}
		});
			
		}
	});
});

