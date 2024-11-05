import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

interface CreatePostPayload {
    content?: string
    imgURL: string
}

const mutations = {
    createPost: async (parent: any, { payload }: { payload: CreatePostPayload }, ctx: GraphqlContext) => {
        if (!ctx.user) throw new Error("Please Login/Signup first!")

        const post = await prismaClient.post.create({
            data: {
                content: payload.content,
                imgURL: payload.imgURL,
                author: { connect: { id: ctx.user.id } }
            }
        })

        return post
    }
}

export const resolvers = {mutations}