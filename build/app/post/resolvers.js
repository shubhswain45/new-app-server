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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../clients/db");
const cloudinary_1 = require("cloudinary");
const queries = {
    getFeedPosts: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // Ensure the user is authenticated
        console.log("ctx.user", ctx.user);
        if (!((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return [];
        }
        // Fetch the first 5 posts from the database
        const posts = yield db_1.prismaClient.post.findMany({
            take: 5, // Limit to 5 posts
        });
        return posts;
    })
};
const mutations = {
    createPost: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { payload }, ctx) {
        // Ensure the user is authenticated
        if (!ctx.user)
            throw new Error("Please Login/Signup first!");
        const { imgURL, content } = payload;
        // Validate the image URL before uploading (you can add additional validation here if necessary)
        if (!imgURL)
            throw new Error("Image URL is required");
        try {
            // Upload image to Cloudinary
            const uploadResult = yield cloudinary_1.v2.uploader.upload(imgURL, {
            // You can add more options like transformation, tags, etc.
            });
            // Create post in the database
            const post = yield db_1.prismaClient.post.create({
                data: {
                    content,
                    imgURL: uploadResult.secure_url, // Store the Cloudinary URL
                    author: { connect: { id: ctx.user.id } } // Associate post with authenticated user
                }
            });
            return post; // Return the created post
        }
        catch (error) {
            // Handle errors gracefully (Cloudinary or Prisma issues)
            console.error("Error creating post:", error);
            throw new Error("Failed to create post. Please try again.");
        }
    })
};
const extraResolvers = {
    Post: {
        author: (parent) => __awaiter(void 0, void 0, void 0, function* () { return yield db_1.prismaClient.user.findUnique({ where: { id: parent.authorId } }); })
    }
};
exports.resolvers = { queries, mutations, extraResolvers };
