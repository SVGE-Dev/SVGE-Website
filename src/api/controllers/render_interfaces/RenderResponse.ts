export interface RenderResponse
{
	page : string;
	tab_title : string;
	page_title : string;
	page_subtitle? : string;
	custom_css? : string[];
	custom_scripts? : string[];
	layout? : boolean;
	user_logged_in? : boolean;

	// SEO and OpenGraph
	canonical? : string;
	desc? : string;
	ogImage? : string;
}