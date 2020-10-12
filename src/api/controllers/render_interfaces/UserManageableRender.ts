import { SiteUser } from "../../entities/siteUser.ent";
import { RenderResponse } from "./RenderResponse";

export interface UserManageableRender extends RenderResponse
{
	people : Array<{
		user : SiteUser;
		avatar : string; //base64
	}>;
	peopleGroup : string; //e.g. game rep, committee member etc
	endpoint : string;
	
	canEditAll : boolean;
	canEditSelf : string | null; // their UUID
}