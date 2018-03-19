/**
 * https://developers.facebook.com/docs/messenger-platform/identity/user-profile
 */
export interface UserProfile {
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


/**
 * https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/projects.agent.sessions.contexts#Context
 */
export interface Context {
    "name": string,
    "lifespanCount": number,
    "parameters": object
}

/**
 * https://dialogflow.com/docs/fulfillment
 */
export interface ResponseJson {
    "fulfillmentText"?: string,
    "fulfillmentMessages"?: [object],
    "source"?: string,
    "payload"?: object,
    "outputContexts"?: [Context],
    "followupEventInput"?: object
}