import functions = require("firebase-functions");
import {request} from "request";

const PAGE_ACCESS_TOKEN = "";

export const dialogflowFirebaseFulfillment = functions.https.onRequest((req, response) => {
    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
        console.log('Invalid Request');
        response.status(400).end('Invalid Webhook Request (expecting v1 webhook req)');
        return;
});

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