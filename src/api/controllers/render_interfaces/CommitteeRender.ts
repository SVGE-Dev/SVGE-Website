import { UserManageableRender } from "./UserManageableRender";

export interface CommitteeRender extends UserManageableRender
{
	userIsCommittee : boolean; // so we know whether or not they can 
}