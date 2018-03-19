import functions = require("firebase-functions");
import {request} from "request";
import {Request, Response} from "firebase-functions";
import {QueryResult, Sessions} from "dialogflow";

const PAGE_ACCESS_TOKEN = "";

/**
 * https://developers.facebook.com/docs/messenger-platform/identity/user-profile
 */
interface UserProfile {
    "first_name": string,
    "last_name": string,
    "profile_pic": string,
    "locale": string,
    "timezone": number,
    "gender": string,
    "is_payment_enabled": boolean,
    "last_ad_referral": {
        "source": string,
        "type": string,
        "ad_id": string
    }
}

export const dialogflowFirebaseFulfillment = functions.https.onRequest((req: Request, response: Response) => {
    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
    let userId: number = getUserID(req);
    if (userId) {
        userProfileRequest(userId).then((userProfile: UserProfile) => console.log(userProfile));
    } else {
        console.log('Invalid Webhook Request (facebook_sender_id not found)');
        response.status(400).end('Invalid Webhook Request (facebook_sender_id not found)');
        return;
    }
});

function getUserID(req: Request) {
    try {
        if (req.body.result) {
            return req.body.originalRequest.data.data.sender.id;
        } else if (req.body.queryResult) {
            return req.body.originalDetectIntentRequest.payload.data.sender.id;
        } else {
            return undefined;
        }
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

function userProfileRequest(userId: number) {
    return new Promise((resolve, reject) => {
        request({
                method: 'GET',
                uri: "https://graph.facebook.com/v2.6/" + userId + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + PAGE_ACCESS_TOKEN
            },
            function (error, response) {
                if (error) {
                    console.error('Error while userProfileRequest: ', error);
                    reject(error);
                } else {
                    console.log('userProfileRequest result: ', response.body);
                    let userInfo = JSON.parse(response.body);
                    userInfo.fb_id = userId;
                    resolve(userInfo);
                }
            });
    });
}

/**
 * https://dialogflow.com/docs/fulfillment
 */
interface ResponseJson {
    "fulfillmentText"?: string,
    "fulfillmentMessages"?: QueryResult.fulfillment_messages,
    "source"?: string,
    "payload"?: QueryResult.webhook_payload,
    "outputContexts"?: QueryResult.output_contexts,
    "followupEventInput"?: Sessions.detectIntent
}


function sendV2Response(response: Response, responseToUser: string | ResponseJson) {
    // if the response is a string send it as a response to the user
    if (typeof responseToUser === 'string') {
        let responseJson = {fulfillmentText: responseToUser}; // displayed response
        response.json(responseJson); // Send response to Dialogflow
    } else {
        // If the response to the user includes rich responses or contexts send them to Dialogflow
        let responseJson: ResponseJson = {};
        // Define the text response
        responseJson.fulfillmentText = responseToUser.fulfillmentText;
        // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
        if (responseToUser.fulfillmentMessages) {
            responseJson.fulfillmentMessages = responseToUser.fulfillmentMessages;
        }
        // Optional: add contexts (https://dialogflow.com/docs/contexts)
        if (responseToUser.outputContexts) {
            responseJson.outputContexts = responseToUser.outputContexts;
        }
        // Send the response to Dialogflow
        console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
        response.json(responseJson);
    }
}