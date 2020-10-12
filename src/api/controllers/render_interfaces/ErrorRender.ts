import { RenderResponse } from "./RenderResponse";

export interface ErrorRender extends RenderResponse
{
	info? : string;
}