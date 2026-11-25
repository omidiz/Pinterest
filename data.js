// Mock data for the MVP. Every profile here is a fictional AI persona.
// Photos: Unsplash (free license) — see CREDITS.md. Self-hosted in /images.
window.PERSONA_DATA = {
  profiles: [
    {
      id: "nyx",
      name: "Nyx Aurel",
      handle: "nyx.aurel",
      kind: "Character",
      creator: { name: "Lena Kovač", handle: "lenakovac" },
      bio: "Synthetic muse. Low light, slow fashion, quiet frames. Generated in Berlin, styled by hand.",
      followers: 48200,
      following: 112,
      tags: ["Editorial", "Monochrome", "Portrait"],
      pins: [
        { src: "images/nyx/1.jpg", w: 1100, h: 1650, title: "Studio, 11pm" },
        { src: "images/nyx/2.jpg", w: 1100, h: 722, title: "Out of the dark" },
        { src: "images/nyx/3.jpg", w: 1100, h: 1650, title: "Colonnade" },
        { src: "images/nyx/4.jpg", w: 1100, h: 1375, title: "Felt & linen" },
        { src: "images/nyx/5.jpg", w: 1100, h: 1650, title: "Copper hour" },
        { src: "images/nyx/6.jpg", w: 1100, h: 858, title: "Grey study" }
      ]
    },
    {
      id: "kai",
      name: "Kai Moreau",
      handle: "kai.moreau",
      kind: "Character",
      creator: { name: "Daniel Osei", handle: "dosei" },
      bio: "A face that doesn't exist, wearing clothes that do. Menswear, shadows, close crops.",
      followers: 31700,
      following: 64,
      tags: ["Menswear", "Portrait", "Monochrome"],
      pins: [
        { src: "images/kai/1.jpg", w: 1100, h: 1375, title: "Half light" },
        { src: "images/kai/2.jpg", w: 1100, h: 1369, title: "Green room" },
        { src: "images/kai/3.jpg", w: 1100, h: 1650, title: "Knit, charcoal" },
        { src: "images/kai/4.jpg", w: 1100, h: 1100, title: "Profile no. 4" },
        { src: "images/kai/5.jpg", w: 1100, h: 1650, title: "After hours" },
        { src: "images/kai/6.jpg", w: 1100, h: 1650, title: "Sand wall" }
      ]
    },
    {
      id: "atelier",
      name: "Atelier Null",
      handle: "ateliernull",
      kind: "Brand",
      creator: { name: "Mira Chen", handle: "mirachen" },
      bio: "An AI-native label. Every look designed, cast and shot without a studio. Drop 03 out now.",
      followers: 126400,
      following: 9,
      tags: ["Street", "Fashion", "Colour"],
      pins: [
        { src: "images/atelier/1.jpg", w: 1100, h: 1728, title: "Drop 03 — Teal" },
        { src: "images/atelier/2.jpg", w: 1100, h: 1523, title: "Court, yellow" },
        { src: "images/atelier/3.jpg", w: 1100, h: 1650, title: "Red signal" },
        { src: "images/atelier/4.jpg", w: 1100, h: 1647, title: "Neon booth" },
        { src: "images/atelier/5.jpg", w: 1100, h: 1654, title: "Plaid, street" },
        { src: "images/atelier/6.jpg", w: 1100, h: 1654, title: "Coastline knit" }
      ]
    }
  ]
};
