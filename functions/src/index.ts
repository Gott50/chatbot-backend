import functions = require("firebase-functions");
import admin = require('firebase-admin');
import {Request, Response} from "firebase-functions";
import {DialogflowFirebaseFulfillment} from './dialogflowFirebaseFulfillment';

function loadPAT() {
    // Load environment variables from .env file
    if (process.env.NODE_ENV !== "production") {
        let dotenv = require('dotenv');
        dotenv.load();
        return process.env.PAGE_ACCESS_TOKEN;
    }
    else {
        admin.initializeApp(functions.config().firebase);
        return functions.config().facebook.page_access_token;
    }
}

const PAGE_ACCESS_TOKEN = loadPAT();

export const dialogflowFirebaseFulfillment = functions.https.onRequest((req: Request, response: Response) => {
    new DialogflowFirebaseFulfillment(PAGE_ACCESS_TOKEN).run(req, response);
});