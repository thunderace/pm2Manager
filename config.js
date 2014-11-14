module.exports = {
	httpPort : 			3001,
	updateInterval : 	5000, // in seconds
	pm2Servers: [ {
		name:			'debianServer',
		ip: 			'192.168.1.230',
		port: 			9615
		} , {
		name:			'domo1',
		ip: 			'192.168.1.40',
		port: 			9615
		} , {
		name:			'domo10',
		ip: 			'192.168.1.120',
		port: 			9615,
		enable:			0
		}
	]
};