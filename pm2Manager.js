var url = require('url');
var path = require('path');
var fs = require('fs');
var request = require('request');
var config = require('./config');

var pm2Host = '192.168.1.230';
var pm2Port = 9615; 
var pm2Url = 'http://' + pm2Host + ':' + pm2Port ;


var app = require('http').createServer(handler).listen(config.httpPort);

var io = require('socket.io').listen(app,{log:false});

var Member = [],client = {},client_id=[],online=0,ips=[];

var basePath = path.dirname(process.argv[1]);

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


io.sockets.on('connection', function (socket) {
    client = {
        time:getTime(),
        ip:socket.handshake.address.address,
        port:socket.handshake.address.port,
        sid:socket.id,
        agent:socket.handshake.headers['user-agent']
    };
    client_id[socket.id]=Member.length;
    if(!ips[client.ip]){
        ips[client.ip]=true;
        online++;
    }

    Member.push(client);

    socket.on('disconnect', function () {
        clearInterval('setID');
        Member.splice(client_id[socket.id],1);
    });

	var getPM2Callback = function(err, data) {
    	if (err == 0) {
        	socket.emit('watchPm2',data);
    	}
	};



    var getPM2 = function(){
    	var serverCount = config.pm2Servers.length;
    	var counter = 0;
    	var data = [];
    	config.pm2Servers.forEach(function(server) {
    		if (server.enable == undefined || server.enable == 1) {
		        request({url:'http://' + server.ip + ':' + server.port, oauth:{}, json:true}, function (error, response, body) {
		            if (!error && response.statusCode == 200) {
		                body.member = Member;
		                body.client = Member[client_id[socket.id]];
		                body.online = online;
		            	data.push(body);
		            	counter++;
	                	getPM2Callback(0,data);
	/*
						if (counter == serverCount) {
		                	getPM2Callback(0,data);
		            	}
	*/	            	
		            }else{
		                // cb(1,error);
		            }
		        })
    		}
    	});
    };

    var setID = setInterval(getPM2,config.updateInterval);

	getPM2(); // initial call

});


var getTime=function(){
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

console.log('daemon started on http://localhost:' + config.httpPort);