import jwt from 'jsonwebtoken'
import { User } from "@prisma/client";
import dotenv from 'dotenv'
import { JWTUser } from '../interfaces';

dotenv.config()

class JWTService {
    public static generateTokenForUser(user: User) {
        const payload: JWTUser = {
            id: user?.id,
            username: user?.username
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET!)
        return token
    }

    public static decodeToken(token: string) {
        return jwt.verify(token, process.env.JWT_SECRET!) as JWTUser
    }
}

export default JWTService