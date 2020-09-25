import { SiteUser } from "../../entities/siteUser.ent";
import { RenderRequest } from "./RenderRequest";

export interface CommitteeRender extends RenderRequest
{
	committee : Array<{
		user : SiteUser,
		avatar : string}>; // handlebars doesn't like getters
	userIsCommittee : boolean; // so we know whether or not they can 
}