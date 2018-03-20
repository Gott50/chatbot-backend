import request = require('request');
import {ResponseJson, UserProfile} from "./interfaces";


export class RequestUserProfile {
    protected PAGE_ACCESS_TOKEN;

    constructor(PAGE_ACCESS_TOKEN: string) {
        this.PAGE_ACCESS_TOKEN = PAGE_ACCESS_TOKEN;
    }

    userProfileRequest(req) {
        let userId = DialogFlowUtils.getUserID(req);
        if (!userId) {
            return Promise.reject(new Error('Invalid Webhook Request (facebook_sender_id not found)'));
        }

        let uri = {
            method: 'GET',
            uri: "https://graph.facebook.com/v2.6/" + userId +
            "?fields=first_name,last_name,profile_pic,locale,timezone,gender,is_payment_enabled,last_ad_referral" +
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
}

export class DialogFlowUtils {
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

    static addContext(session: string, responseToUser: ResponseJson, context: { context: string; parameters: object }): ResponseJson {
        responseToUser = JSON.parse(JSON.stringify(responseToUser, (k, v) => {
            if (typeof v === 'string') {
                for (let prop in context.parameters)
                    v = v.replace("#" + context.context + "." + prop, context.parameters[prop]);
            }
            return v;
        }));
        responseToUser.outputContexts = [
            {
                "name": session + "/contexts/" + context.context,
                "lifespanCount": 5,
                "parameters": context.parameters
            }
        ];
        return responseToUser;
    }

    static getUserID(req): number {
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
}

export class DialogflowFirebaseFulfillment {
    private requestUserProfile: RequestUserProfile;

    constructor(PAGE_ACCESS_TOKEN: string) {
        this.requestUserProfile = new RequestUserProfile(PAGE_ACCESS_TOKEN);
    }


    run(req, response) {
        console.log('Request:', req.body);
        this.requestUserProfile.userProfileRequest(req).then((userProfile: UserProfile) =>
            DialogFlowUtils.sendV2Response(response,
                DialogFlowUtils.addContext(req.body.session, req.body.queryResult, {
                    context: "user_profile",
                    parameters: userProfile
                })))
            .catch(reason => {
                console.log(reason);
                response.status(400).end(JSON.stringify(reason));
                return;
            });
    }

}