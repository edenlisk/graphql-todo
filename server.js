import {ApolloServer} from "@apollo/server";
import {expressMiddleware as apolloMiddleware} from "@apollo/server/express4";
import {errorFormatter as formatError} from "./utils/errorUtils.js";
import express from 'express';
import {readFile} from 'node:fs/promises';
import {config} from "dotenv";
import {resolvers} from "./resolvers.js";
import cors from 'cors';
import mongoose from "mongoose";
import {authMiddleWare, getContext} from "./utils/helperFunctions.js";
import {login} from "./controllers/authControllers.js";

config();
const PORT = process.env.PORT;
const app = express();
const typeDefs = await readFile('./schema/schema.graphql', 'utf8');

app.use(cors(), express.json());
app.use(authMiddleWare)
app.set('port', PORT);
const server = new ApolloServer({typeDefs, resolvers, formatError, includeStacktraceInErrorResponses: false});
mongoose.connect(process.env.MONGO_URI, {dbName: "Todos"})
    .then(() => console.log('Connection to database was successful'))
    .catch(err => console.log(err.message));
await server.start();
app.use('/login', login)
app.use('/graphql', apolloMiddleware(server, {context: getContext}));

app.listen({port: PORT}, () => {
    console.log(`Server is listening on ${PORT}`)
    console.log(`Graphql server is listening on http://localhost:8000/graphql`);
})
