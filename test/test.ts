import {Ack, createRouter, Next, Reason, RouterContext} from "../src";
import * as client from 'socket.io-client';
import * as chai from "chai";
import {Socket, Server} from "socket.io";



describe("Test Router", () => {

    const expect = chai.expect;

    describe('use', () => {
        let server: Server;
        let socket: SocketIOClient.Socket;
        beforeEach(() => {
            server = new Server();
            server.listen(3000, {allowEIO3: true});
        });
        afterEach(() => {
            socket.close();
            server.close();
        });

        it("1", (done) => {
            const routerContext = new RouterContext();
            routerContext.use<[string]>("test", (socket: Socket, event: string, params: [string], ack: ((...params: any[]) => any) | undefined, next: (err?: any) => any) => {
                ack && ack(params[0]);
            });
            server.use(createRouter(routerContext));
            socket = client("http://localhost:3000");
            socket.emit("test", "test", (msg: string) => {
                expect(msg).to.be.equal("test");
                done();
            });
        });

        it("2", (done) => {
            const routerContext = new RouterContext();
            routerContext.use<[string]>("test", (socket: Socket, event: string, params: [string], ack: Ack | undefined, next: (err?: any) => any) => {
                next(new Error('error'));
            });
            routerContext.use((socket: Socket, err: any, ack: ((...params: any[]) => any) | undefined) => {
                ack && ack(err.message);
            });
            server.use(createRouter(routerContext));
            socket = client("http://localhost:3000");
            socket.emit("test", "test", (msg: string) => {
                expect(msg).to.be.equal("error");
                done();
            });
        });
    });

    describe('onConnect', () => {
        let server: Server;
        let socket: SocketIOClient.Socket;
        beforeEach(() => {
            server = new Server();
            server.listen(3000, {allowEIO3: true});
        });
        afterEach(() => {
            socket.close();
            server.close();
        });

        it("1", (done) => {
            const routerContext = new RouterContext();
            routerContext.onConnect((socket: Socket, next: (err?: any) => any) => {
                socket.emit("test", "test")
            });
            server.use(createRouter(routerContext));
            socket = client("http://localhost:3000");
            socket.on("test", (msg: string) => {
                expect(msg).to.be.equal("test");
                done();
            });
        });
    });

    describe('onDisconnect', () => {
        let server: Server;
        let socket: SocketIOClient.Socket;
        beforeEach(() => {
            server = new Server();
            server.listen(3000, {allowEIO3: true});
        });
        afterEach(() => {
            server.close();
        });

        it("1", (done) => {
            socket = client("http://localhost:3000");
            const routerContext = new RouterContext();
            routerContext.onDisconnect((socket: Socket, reason: Reason | undefined, next: Next) => {
                console.log({reason})
                done();
            });
            server.use(createRouter(routerContext));
            socket.on("connect", () => {
                socket.close();
            });
        });
    });


});

