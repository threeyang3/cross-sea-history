/// <reference types="vite/client" />
import atlasScript from "./atlas.js?raw";
import atlasStyles from "./atlas.css?raw";
import atlasData from "./data.json";
import siteLinks from "../city-atlas-links.json";
import timeline from "../data/timeline.json";
import { renderCityAtlas } from "./html.mjs";

// Sites applies the same access policy to this route and the homepage.
export function cityAtlasDocument() {
 return new Response(renderCityAtlas({atlasData,siteLinks,timeline,atlasScript,atlasStyles}),{headers:{"Content-Type":"text/html; charset=utf-8"}});
}
