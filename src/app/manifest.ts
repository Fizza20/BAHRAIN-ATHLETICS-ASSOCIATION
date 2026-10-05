import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bahrain Athletics Association",
    short_name: "BAA",
    description: "The home of Bahraini athletics",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0d",
    theme_color: "#ce1126",
    icons: [{ src: "/icon.png", sizes: "209x209", type: "image/png" }],
  };
}
