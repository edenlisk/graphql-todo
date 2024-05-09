import {GraphQLError} from "graphql";
import {expressjwt} from "express-jwt";

const secret = Buffer.from("graphql-todo", "base64")

export function appError(message, code) {
    return new GraphQLError(message, { extensions: { code } });
}

export const authMiddleWare = expressjwt({
    secret,
    algorithms: ['HS256'],
    credentialsRequired: false
})

export function toIsoDate(date) {
    return date.slice(0, 'yyyy-mm-dd'.length);
}


export function getContext ({ req }) {
    if (req.auth) {
        return { auth: req.auth }
    }
    return { };
}