"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
    type User {
        id: ID!
        username: String!
        fullName: String!
        email: String!
        profileImageURL: String
        isVerified: Boolean!
    }
`;
