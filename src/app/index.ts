import express, { Response, Request } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Auth } from './auth';
import { GraphqlContext } from '../interfaces';

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

    const graphqlServer = new ApolloServer<GraphqlContext>({
        typeDefs: `
            ${Auth.types}

            type Query {
                sayHello: String!
            }

            type Mutation {
                ${Auth.mutations}
            }

        `,
        resolvers: {
            Query: {
                sayHello: () => "hello"
            },

            Mutation: {
                ...Auth.resolvers.mutations
            }
        },
    });

    await graphqlServer.start();

    // Middleware for handling GraphQL requests
    app.use('/graphql', expressMiddleware(graphqlServer, {
        context: async ({ req, res }: { req: Request, res: Response }) => {
            return {
                req,
                res
            };
        }
    }));

    return app;
}
