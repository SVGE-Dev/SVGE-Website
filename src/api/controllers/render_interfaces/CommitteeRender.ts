import { SiteUser } from "../../entities/siteUser.ent";
import { RenderRequest } from "./RenderRequest";

export interface CommitteeRender extends RenderRequest
{
	committee : SiteUser[];
	userIsCommittee : boolean; // so we know whether or not they can 
}