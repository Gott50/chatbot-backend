import {ResponseJson} from "./interfaces";

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
                "lifespanCount": 10,
                "parameters": context.parameters
            }
        ];
        return responseToUser;
    }

    static getUserID(body: any): number {
        try {
            if (body.result) {
                return body.originalRequest.data.data.sender.id;
            } else if (body.queryResult) {
                return body.originalDetectIntentRequest.payload.data.sender.id;
            } else {
                return undefined;
            }
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }
}