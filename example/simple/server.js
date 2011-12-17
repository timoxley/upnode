var dnode = require('dnode');
var upnode = require('../../');

var server = dnode(function (client, conn) {
    this.time = function (cb) { cb(new Date().toString()) };
});
server.use(upnode.ping);
server.listen(7000);
