import request = require('request');
import {ResponseJson, UserProfile} from "./interfaces";


export class DialogflowFirebaseFulfillment {
    private PAGE_ACCESS_TOKEN;

    constructor(PAGE_ACCESS_TOKEN: string) {
        this.PAGE_ACCESS_TOKEN = PAGE_ACCESS_TOKEN;
    }

    static getUserID(req) {
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

    static sendV2Response(response, responseToUser: string | ResponseJson) {
        console.log("sendV2Response:", responseToUser);
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
            if (responseToUser.source) {
                responseJson.source = responseToUser.source;
            }
            if (responseToUser.payload) {
                responseJson.payload = responseToUser.payload;
            }
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            if (responseToUser.outputContexts) {
                responseJson.outputContexts = responseToUser.outputContexts;
            }
            if (responseToUser.followupEventInput) {
                responseJson.followupEventInput = responseToUser.followupEventInput;
            }
            // Send the response to Dialogflow
            console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
            response.json(responseJson);
        }
    }

    userProfileRequest(userId: number) {
        let uri = {
            method: 'GET',
            uri: "https://graph.facebook.com/v2.6/" + userId +
            "?fields=first_name,last_name,profile_pic,locale,timezone,gender" +
            "&access_token=" + this.PAGE_ACCESS_TOKEN
        };
        console.log("userProfileRequest:", uri);
        return new Promise((resolve, reject) => request(uri, (error, response) => {
            if (error) {
                console.error('Error while userProfileRequest: ', error);
                reject(error);
            }
            else {
                console.log('userProfileRequest result: ', response.body);
                let userInfo = JSON.parse(response.body);
                userInfo.fb_id = userId;
                resolve(userInfo);
            }
        }));
    }

    run(req, response) {
        console.log('Request:', req.body);
        let userId: number = DialogflowFirebaseFulfillment.getUserID(req);
        if (userId) {
            this.userProfileRequest(userId).then((userProfile: UserProfile) =>
                DialogflowFirebaseFulfillment.sendV2Response(response, JSON.stringify(userProfile)))
                .catch(reason => {
                    console.log(reason);
                    response.status(400).end(JSON.stringify(reason));
                    return;
                });
        } else {
            console.log('Invalid Webhook Request (facebook_sender_id not found)');
            let responseToUser = req.body.queryResult;
            responseToUser.outputContexts = [
                {
                    "name": req.body.session + "/contexts/user_profile",
                    "lifespanCount": 5,
                    "parameters": {
                        "Name": "param value"
                    }
                }
            ];
            responseToUser = JSON.parse(JSON.stringify(responseToUser, (key, value) => {
                if (typeof value === 'string') {
                    return value.replace("#user_profile.Name", "fff");
                }
                return value;
            }));

            DialogflowFirebaseFulfillment.sendV2Response(response, responseToUser);
            return;
        }
    }
}