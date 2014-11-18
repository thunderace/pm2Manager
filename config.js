module.exports = {
	httpPort : 			3001,
	updateInterval : 	5000, // in seconds
	pm2Servers: [ {
		ip:			'192.168.1.230',   //debianserver
		port: 			9615
		} , {
		ip:			'192.168.1.40', //domo1
		port: 			9615
		} , {
		ip:			'192.168.1.190', // P5KE
		port: 			9615,
		enable:			1
		}, {
		ip:			'192.168.1.120', // domo10
		port: 			9615,
		enable:			1
		}
	]
};