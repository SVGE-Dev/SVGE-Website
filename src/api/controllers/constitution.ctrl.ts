import { Controller, Get, Render, Param } from "routing-controllers";

//@Controller("/docs")
export class ConstitutionController
{
    @Get("/")
    @Render("constitution")
    private officialDocs()
    {
        return {
            tab_title: "SVGE | Home"
        };
    }

    @Get("/:doc")
    @Render("doc")
    private doc(@Param("doc") doc : string)
    {
        return {
            tab_title: `SVGE | ${doc}`
        };
    }
}