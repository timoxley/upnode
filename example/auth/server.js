var dnode = require('dnode');
var upnode = require('../../');

var server = dnode(function (client, conn) {
    this.auth = function (user, pass, cb) {
        if (user === 'moo' && pass === 'hax') {
            cb(null, {
                beep : function (fn) { fn('boop at ' + new Date) }
            });
        }
        else cb('ACCESS DENIED')
    };
});
server.use(upnode.ping);
server.listen(7000);
