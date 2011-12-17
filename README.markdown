upnode
======

Keep a dnode connection alive and re-establish state between reconnects
with a transactional message queue.

example
=======

Write a dnode server as usual but enable the upnode ping middleware with
`server.use(upnode.ping)`.

server.js:

``` js
var dnode = require('dnode');
var upnode = require('upnode');

var server = dnode(function (client, conn) {
    this.time = function (cb) { cb(new Date().toString()) };
});
server.use(upnode.ping);
server.listen(7000);
```

Now when you want to make a call to the server, guard your connection in the
`up()` function. If the connection is alive the callback fires immediately.
If the connection is down the callback is buffered and fires when the connection
is ready again.

client.js:

``` js
var upnode = require('upnode');
var up = upnode.connect(7000);

setInterval(function () {
    up(function (remote) {
        remote.time(function (t) {
            console.log('time = ' + t);
        });
    });
}, 1000);
```

If we fire the client up first, then wait a few seconds to fire up the server:

```
$ node client.js & sleep 5; node server.js
[1] 9165
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:49 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:50 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:51 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:52 GMT-0800 (PST)
```

we can see that the first 5 seconds worth of requests are buffered and all come
through at `23:47:48`. The requests then come in one per second once the
connection has been established.

If we kill the server and bring it back again while the client is running we can
observe a similar discontinuity as all the pending requests come through at `23:50:20`:

```
$ node client.js 
time = Fri Dec 16 2011 23:50:11 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:11 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:12 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:13 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:21 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:22 GMT-0800 (PST)
```
