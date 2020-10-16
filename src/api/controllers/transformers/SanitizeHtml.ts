import * as sanitize from "sanitize-html";
import { Transform } from "class-transformer";

type AllowedAttributesType = Record<string, string[]>;

export const SanitizeHtml = (allowedTags : string[] = [], allowedAttributes : AllowedAttributesType = {}) : PropertyDecorator =>
{
	return Transform((val) => sanitize(val, { allowedTags: allowedTags, allowedAttributes: allowedAttributes}));
};