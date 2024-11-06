"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
    input createPostData {
        content: String
        imgURL: String!
    }

    type Post {
        id: ID!
        content: String
        imgURL: String!

        author: User
    }
`;
