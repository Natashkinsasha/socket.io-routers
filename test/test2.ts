import * as Server from "socket.io";
import * as client from 'socket.io-client';
import * as chai from "chai";
import * as SocketRouter from "socket.io-routers";


describe("Test Router", () => {

    const expect = chai.expect;

    describe('use', () => {
        let io: SocketIO.Server;
        let socket: SocketIOClient.Socket;
        beforeEach(() => {
            io = Server();
            io.listen(3000);
        });
        afterEach(() => {
            socket.close();
            io.close();
        });

        it("1", (done) => {
            const router = SocketRouter();
            router.use("test", (io, socket, path, params, ack, next) => {
                ack(params[0]);
            });
            io.use(router);
            socket = client("http://localhost:3000");
            socket.emit("test", "test", (msg: string) => {
                expect(msg).to.be.equal("test");
                done();
            });
        });

        it("2", (done) => {
            const router = SocketRouter();
            router.use("test", (io, socket, path, params, ack, next) => {
                next(new Error('error'));
            });
            router.use((io, socket, path, params, ack, err) => {
                ack(err.message);
            });
            io.use(router);
            socket = client("http://localhost:3000");
            socket.emit("test", "test", (msg: string) => {
                expect(msg).to.be.equal("error");
                done();
            });
        });
    });

    describe('onConnect', () => {
        let io: SocketIO.Server;
        let socket: SocketIOClient.Socket;
        beforeEach(() => {
            io = Server();
            io.listen(3000);
        });
        afterEach(() => {
            socket.close();
            io.close();
        });

        it("1", (done) => {
            const router = SocketRouter();
            router.onConnect((io, socket) => {
                socket.emit("test", "test")
            });
            io.use(router);
            socket = client("http://localhost:3000");
            socket.on("test", (msg: string) => {
                expect(msg).to.be.equal("test");
                done();
            });
        });
    });

    describe('onDisconnect', () => {
        let io: SocketIO.Server;
        let socket: SocketIOClient.Socket;
        beforeEach(() => {
            io = Server();
            io.listen(3000);
        });
        afterEach(() => {
            io.close();
        });

        it("1", (done) => {
            socket = client("http://localhost:3000");
            const router = SocketRouter();
            router.onDisconnect((io, socket) => {
                done();
            });
            io.use(router);
            socket.on("connect", () => {
                socket.close();
            });
        });
    });


});

