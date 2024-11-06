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
exports.resolvers = void 0;
const db_1 = require("../../clients/db");
const axios_1 = __importDefault(require("axios"));
const JWTService_1 = __importDefault(require("../../services/JWTService"));
const queries = {
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!id)
                return null;
            const user = yield db_1.prismaClient.user.findUnique({ where: { id } });
            return user;
        }
        catch (error) {
            return null;
        }
    })
};
const mutations = {
    loginWithGoogle: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { token }, ctx) {
        try {
            const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
            googleOauthURL.searchParams.set('id_token', token);
            const { data } = yield axios_1.default.get(googleOauthURL.toString(), {
                responseType: 'json'
            });
            console.log("data", data);
            // Check if the email is verified
            if (!data.email_verified) {
                throw new Error("Email not verified by Google.");
            }
            let user = yield db_1.prismaClient.user.findUnique({ where: { email: data.email } });
            if (!user) {
                user = yield db_1.prismaClient.user.create({
                    data: {
                        username: data.email.split("@")[0],
                        fullName: data.family_name || data.given_name,
                        email: data.email,
                        profileImageURL: data.picture,
                        isVerified: true,
                    }
                });
            }
            const userToken = JWTService_1.default.generateTokenForUser(user);
            ctx.res.cookie("__mellowMoments_token", userToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            return user;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    logout: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            ctx.res.clearCookie("__mellowMoments_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict'
            });
            return true;
        }
        catch (error) {
            throw new Error("Logout failed. Please try again.");
        }
    }),
};
exports.resolvers = { queries, mutations };
