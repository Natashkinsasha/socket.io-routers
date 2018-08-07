socket.io-routers
================

Router to use with socket.io


## Installation

Npm
```javascript
npm install socket.io-routers
```

Yarn
```javascript
yarn add socket.io-routers
```

# Support

This library is quite fresh, and maybe has bugs. Write me an **email** to *natashkinsash@gmail.com* and I will fix the bug in a few working days.

# Quick start

```javascript
const Router = require('socket.io-routers');
const Server = require('socket.io');

const io = Server();
const router = Router();

router.onConnect((io, socket, next) => {
    doSmth();
});

router.onDisconnect((io, socket, reason, next) => {
    doSmth();
});

router.use("test", (io, socket, path, params, ack, next) => {
    doSmth()
        .then((msg)=>{
            ack(msg);
        })
        .catch((err)=>{
            next(err);
        })
});
router.use((io, socket, err, ack) => {
    socket.emit("error", err.message)
});
io.use(router);
io.listen(3000);

```