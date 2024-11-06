"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = initServer;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser")); // Body parser for JSON handling
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./auth");
const JWTService_1 = __importDefault(require("../services/JWTService"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const post_1 = require("./post");
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        // CORS configuration
        const corsOptions = {
            origin: ['http://localhost:3000'],
            credentials: true,
        };
        // Use CORS middleware
        app.use((0, cors_1.default)(corsOptions));
        // Increase the limit for JSON payload
        app.use(body_parser_1.default.json({ limit: '10mb' })); // Increase to 10 MB or another limit you prefer
        app.use((0, cookie_parser_1.default)());
        const graphqlServer = new server_1.ApolloServer({
            typeDefs: `
            ${auth_1.Auth.types}
            ${post_1.Post.types}

            type Query {
                ${auth_1.Auth.queries}
                ${post_1.Post.queries}
            }

            type Mutation {
                ${auth_1.Auth.mutations}
                ${post_1.Post.mutations}
            }
        `,
            resolvers: Object.assign({ Query: Object.assign(Object.assign({}, auth_1.Auth.resolvers.queries), post_1.Post.resolvers.queries), Mutation: Object.assign(Object.assign({}, auth_1.Auth.resolvers.mutations), post_1.Post.resolvers.mutations) }, post_1.Post.resolvers.extraResolvers),
        });
        yield graphqlServer.start();
        // Middleware for handling GraphQL requests
        app.use("/graphql", (0, express4_1.expressMiddleware)(graphqlServer, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req, res }) {
                let token;
                // First, check if the token is in the Authorization header
                if (req.headers.authorization) {
                    // Extract the token from the Authorization header
                    token = req.headers.authorization.split("Bearer ")[1];
                }
                // If the token isn't in the Authorization header, check if it's in cookies
                if (!token && req.cookies["__mellowMoments_token"]) {
                    token = req.cookies["__mellowMoments_token"];
                }
                // Decode the token if available
                let user;
                if (token) {
                    user = JWTService_1.default.decodeToken(token);
                }
                // Return the context with the decoded user
                return {
                    user,
                    req,
                    res
                };
            })
        }));
        return app;
    });
}
