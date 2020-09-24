export interface RenderRequest
{
	page : string;
	tab_title : string;
	page_title : string;
	page_subtitle? : string;
	custom_css? : string[];
	custom_scripts? : string[];
	layout? : boolean;
}