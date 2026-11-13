import { z } from "zod";
export const evidenceSchema = z.object({
  id: z.string(),
  kind: z.enum(["observation", "educational", "research", "imagery"]),
  title: z.string(),
  sourceUrl: z.url(),
  provider: z.string(),
  recordId: z.string(),
  observedAt: z.string(),
  retrievedAt: z.string(),
  context: z.string(),
  summary: z.string(),
  gameUse: z.string(),
  limitations: z.string(),
  credit: z.string(),
  usageTermsUrl: z.url(),
  reviewStatus: z.literal("reviewed"),
  originalFields: z.record(z.string(), z.string()),
});
export const evidence = z.array(evidenceSchema).parse([
  {
    id: "osdr-plants",
    kind: "research",
    title: "How light helps space seedlings",
    sourceUrl: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-314",
    provider: "NASA OSDR / Seedling Growth investigators",
    recordId: "OSD-314 version 7; DOI 10.3390/ijms22020899",
    observedAt: "SpaceX-4 and SpaceX-6 experiments; published 2021-01-18",
    retrievedAt: "2026-11-13",
    context:
      "Six-day-old Arabidopsis thaliana seedlings; ISS European Modular Cultivation System, reduced-gravity treatments and Earth controls.",
    summary:
      "Researchers studied how small plants respond to gravity and red light. Their results show that lighting conditions matter when planning plant growth in space.",
    gameUse:
      "Inspires greenhouse lighting and a discussion about spending power to support plants.",
    limitations:
      "These were seedlings in controlled experiments, not food crops grown on Mars. The study does not establish game harvest times or meal yields.",
    credit:
      "Villacampa, Ciska, Manzano, Vandenbrink, Kiss, Herranz and Medina (2021); NASA OSDR metadata.",
    usageTermsUrl: "https://www.mdpi.com/1422-0067/22/2/899",
    reviewStatus: "reviewed",
    originalFields: {
      organism: "Arabidopsis thaliana",
      accession: "OSD-314",
      datasetDOI: "10.26030/z5yf-jx91",
      publicationDOI: "10.3390/ijms22020899",
      publicationUrl: "https://www.mdpi.com/1422-0067/22/2/899",
      supportingSections: "Abstract, Introduction, Results 2.1",
    },
  },
  {
    id: "radlab-iss",
    kind: "observation",
    title: "Radiation readings from the ISS",
    sourceUrl: "https://visualization.osdr.nasa.gov/radlab/gui/data-api/",
    provider: "NASA OSDR RadLab / DosTel",
    recordId: "DosTel1; ISS; 2022-04-01T23:00–23:05",
    observedAt: "2022-04-01",
    retrievedAt: "2026-11-13",
    context:
      "Four absorbed-dose-rate observations from one dosimeter aboard the International Space Station.",
    summary:
      "Instruments measure radiation over time. Even a short series can show that the readings change.",
    gameUse:
      "A contextual chart shows real observations alongside the fictional game model.",
    limitations:
      "These are ISS measurements in microgray per hour, not Mars measurements, astronaut health probabilities, or game exposure points. Four readings cannot characterize a mission.",
    credit:
      "DosTel instrument contributors via NASA OSDR RadLab. See instrument knowledgebase for contributor details.",
    usageTermsUrl:
      "https://visualization.osdr.nasa.gov/radlab/gui/knowledgebase/",
    reviewStatus: "reviewed",
    originalFields: {
      instrument_id: "DosTel1",
      spacecraft: "ISS",
      measurement: "absorbed_dose_rate",
      units: "μGy/hour",
      queryInterval: "2022-04-01T23:00 inclusive to 23:05 exclusive",
    },
  },
  {
    id: "jezero-image",
    kind: "imagery",
    title: "A real view of Jezero Crater",
    sourceUrl: "https://images.nasa.gov/details/PIA24485",
    provider: "NASA Image and Video Library",
    recordId: "PIA24485",
    observedAt: "2021-02-22",
    retrievedAt: "2026-11-13",
    context:
      "Perseverance Mastcam-Z image of a delta remnant, viewed from its landing site.",
    summary:
      "Perseverance photographed rock layers at Jezero Crater. Scientists investigate these rocks to learn about Mars’s ancient environment.",
    gameUse:
      "A real Mars image in the science library provides context for the fictional rover sample stop.",
    limitations:
      "The outpost and sampling route are original illustrations, not a reconstruction of this image or an approved landing site. NASA library catalog date is 2021-03-05; acquisition date is 2021-02-22.",
    credit:
      "NASA/JPL-Caltech/ASU/MSSS; image PIA24485, local small derivative supplied by NASA.",
    usageTermsUrl: "https://www.jpl.nasa.gov/jpl-image-use-policy/",
    reviewStatus: "reviewed",
    originalFields: {
      imageUrl:
        "https://images-assets.nasa.gov/image/PIA24485/PIA24485~small.jpg",
      localAsset: "/assets/jezero-delta.jpg",
      instrument: "Mastcam-Z",
      catalogDate: "2021-03-05",
      acquisitionDate: "2021-02-22",
    },
  },
  {
    id: "donki-flare",
    kind: "observation",
    title: "A real solar flare: 10 May 2024",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/events/30666/2/",
    provider: "NASA CCMC / M2M",
    recordId: "2024-05-10T06:27:00-FLR-001",
    observedAt: "2024-05-10T06:27:00Z",
    retrievedAt: "2026-11-13",
    context: "M2M catalog; GOES-P EXIS observation of a solar flare.",
    summary:
      "Scientists recorded an X3.9 solar flare. Space-weather observations help mission teams investigate events near the Sun.",
    gameUse:
      "Inspires the archived solar-warning card. The timing and exposure in your mission are fictional.",
    limitations:
      "A solar flare class does not measure radiation at a Mars outpost or show that an event reached Mars.",
    credit:
      "NASA CCMC, Moon to Mars Space Weather Analysis Office; GOES observations.",
    usageTermsUrl: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
    reviewStatus: "reviewed",
    originalFields: {
      classType: "X3.9",
      beginTime: "2024-05-10T06:27:00Z",
      peakTime: "2024-05-10T06:54:00Z",
      endTime: "2024-05-10T07:06:00Z",
      sourceRegion: "13664",
    },
  },
  {
    id: "moxie",
    kind: "educational",
    title: "Making oxygen from Mars air",
    sourceUrl:
      "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/",
    provider: "NASA / JPL-Caltech",
    recordId: "MOXIE mission-completion article",
    observedAt: "2023-09-06",
    retrievedAt: "2026-11-13",
    context: "Technology demonstration aboard the Perseverance rover.",
    summary:
      "MOXIE demonstrated how to extract oxygen from carbon dioxide in the Martian atmosphere.",
    gameUse:
      "Inspires the oxygen-production system, which competes for your electricity.",
    limitations:
      "The real instrument was a demonstration, not a working crew-scale life-support plant. All game yields are fictional.",
    credit: "NASA / JPL-Caltech.",
    usageTermsUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    reviewStatus: "reviewed",
    originalFields: {},
  },
  {
    id: "csa-food",
    kind: "educational",
    title: "Growing food away from Earth",
    sourceUrl:
      "https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/",
    provider: "Canadian Space Agency",
    recordId: "Food production on the Moon and in remote areas toolkit",
    observedAt: "Not an observation",
    retrievedAt: "2026-11-13",
    context:
      "Educational toolkit about food production and astronaut nutrition.",
    summary:
      "Growing food is part of planning how people can live and work far from Earth.",
    gameUse: "The greenhouse trades electricity and water now for food later.",
    limitations:
      "Two-turn growth, water costs, and meal yields are teaching rules, not measured crop performance.",
    credit: "Canadian Space Agency; summary written for this game.",
    usageTermsUrl: "https://www.asc-csa.gc.ca/eng/terms.asp",
    reviewStatus: "reviewed",
    originalFields: {},
  },
]);
