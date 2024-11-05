import express, { Response, Request } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Auth } from './auth';
import { GraphqlContext } from '../interfaces';
import JWTService from '../services/JWTService';
import cookieParser from 'cookie-parser'
import { Post } from './post';

export async function initServer() {
    const app = express();

    // CORS configuration
    const corsOptions = {
        origin: ['http://localhost:3000'],
        credentials: true,
    };

    // Use CORS middleware
    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(cookieParser())

    const graphqlServer = new ApolloServer<GraphqlContext>({
        typeDefs: `
            ${Auth.types}
            ${Post.types}

            type Query {
                ${Auth.queries}
            }

            type Mutation {
                ${Auth.mutations}
                ${Post.mutations}
            }

        `,
        resolvers: {
            Query: {
                ...Auth.resolvers.queries
            },

            Mutation: {
                ...Auth.resolvers.mutations,
                ...Post.resolvers.mutations
            }
        },
    });

    await graphqlServer.start();

    // Middleware for handling GraphQL requests
    app.use("/graphql", expressMiddleware(graphqlServer, {
        context: async ({ req, res }: { req: Request, res: Response }) => {
            let user;

            user = req.cookies["__mellowMoments_token"]
                ? JWTService.decodeToken(req.cookies["__mellowMoments_token"])
                : undefined;

            return {
                user,
                req,
                res
            };
        }
    }));

    return app;
}
