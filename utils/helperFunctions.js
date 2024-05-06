import {GraphQLError} from "graphql";

export function appError(message, code) {
    return new GraphQLError(message, { extensions: { code} });
}

export function toIsoDate(date) {
    return date.slice(0, 'yyyy-mm-dd'.length);
}