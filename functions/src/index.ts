import functions = require("firebase-functions");
import {request} from "request";

const PAGE_ACCESS_TOKEN = "";

export const dialogflowFirebaseFulfillment = functions.https.onRequest((req, response) => {
    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
    let userId: number = getUserID(req);
    if (userId) {
        userInfoRequest(userId);
    } else {
        console.log('Invalid Webhook Request (facebook_sender_id not found)');
        response.status(400).end('Invalid Webhook Request (facebook_sender_id not found)');
        return;
    }
});

function getUserID(req) {
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

function userInfoRequest(userId) {
    return new Promise((resolve, reject) => {
        request({
                method: 'GET',
                uri: "https://graph.facebook.com/v2.6/" + userId + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + PAGE_ACCESS_TOKEN
            },
            function (error, response) {
                if (error) {
                    console.error('Error while userInfoRequest: ', error);
                    reject(error);
                } else {
                    console.log('userInfoRequest result: ', response.body);
                    let userInfo = JSON.parse(response.body);
                    userInfo.fb_id = userId;
                    resolve(userInfo);
                }
            });
    });
}