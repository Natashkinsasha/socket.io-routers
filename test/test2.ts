import router from "socket.io-routers";
import * as Server from "socket.io";
import * as client from 'socket.io-client';
import * as chai from "chai";
import {Socket} from "socket.io";



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
            const testRouter: router.Router = router();
            testRouter.use("test", (io: SocketIO.Server, socket: Socket, path: string, params: any[], ack: ((...params: any[]) => any) | undefined, next: (err?: any) => any) => {
                ack && ack(params[0]);
            });
            io.use(testRouter);
            socket = client("http://localhost:3000");
            socket.emit("test", "test", (msg: string) => {
                expect(msg).to.be.equal("test");
                done();
            });
        });

        it("2", (done) => {
            const testRouter = router();
            testRouter.use("test", (io: SocketIO.Server, socket: Socket, path: string, params: any[], ack: ((...params: any[]) => any) | undefined, next: (err?: any) => any) => {
                next(new Error('error'));
            });
            testRouter.use((io: SocketIO.Server, socket: Socket, err: any, ack: ((...params: any[]) => any) | undefined) => {
                ack && ack(err.message);
            });
            io.use(testRouter);
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
            const testRouter = router();
            testRouter.onConnect((io: SocketIO.Server, socket: Socket, next: (err?: any) => any) => {
                socket.emit("test", "test")
            });
            io.use(testRouter);
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
            const testRouter = router();
            testRouter.onDisconnect((io: SocketIO.Server, socket: Socket, reason: string | undefined, next: (err?: any) => any) => {
                done();
            });
            io.use(testRouter);
            socket.on("connect", () => {
                socket.close();
            });
        });
    });


});

