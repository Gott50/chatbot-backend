import request = require('request');
import {DialogFlowUtils} from "./dialogflowFirebaseFulfillment";

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