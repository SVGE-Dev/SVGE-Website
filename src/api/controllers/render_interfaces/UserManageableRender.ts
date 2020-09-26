import { SiteUser } from "../../entities/siteUser.ent";
import { RenderRequest } from "./RenderRequest";

export interface UserManageableRender extends RenderRequest
{
	people : Array<{
		user : SiteUser;
		avatar : string; //base64
	}>;
	peopleGroup : string; //e.g. game rep, committee member etc
	endpoint : string;
}