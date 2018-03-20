import {UserProfile} from "./interfaces";
import {RequestUserProfile} from "./RequestUserProfile";
import {DialogFlowUtils} from "./DialogFlowUtils";


export class DialogflowFirebaseFulfillment {
    private requestUserProfile: RequestUserProfile;

    constructor(PAGE_ACCESS_TOKEN: string) {
        this.requestUserProfile = new RequestUserProfile(PAGE_ACCESS_TOKEN);
    }


    run(request, response) {
        console.log('Request:', request.body);
        this.requestUserProfile.userProfileRequest(request.body).then((userProfile: UserProfile) =>
            DialogFlowUtils.sendV2Response(response,
                DialogFlowUtils.addContext(request.body.session, request.body.queryResult, {
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