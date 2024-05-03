import { ApolloServerErrorCode } from "@apollo/server/errors";

export const errorFormatter = (formattedError, error) => {
    if (formattedError.extensions.code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED) {

        return {
            ...formattedError,
            message: "Your query doesn't match the schema. Try double-checking it!",
            extensions: {
                code: "GRAPHQL_VALIDATION_ERROR"
            }
        }
    }
    if (formattedError.extensions.code === ApolloServerErrorCode.GRAPHQL_PARSE_FAILED) {
        return {
            ...formattedError,
            message: "Invalid GRAPHQL query string. Try double-checking!",
            extensions: {
                code: "INVALID_GRAPHQL_STRING"
            }
        }
    }
    return formattedError;
}