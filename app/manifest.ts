import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Connected Trial Platform — GSK",
    short_name: "Trial Platform",
    description:
      "Role-based platform for GSK Phase II oncology recruitment and enrolment.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f36633",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
