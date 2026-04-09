export type HelpTopic = {
  id: string;
  title: string;
  shortTitle: string;
  summary: string;
  aiPrompt: string;
};

export type SampleLink = {
  label: string;
  href: string;
  note?: string;
};

export type SurveyLearningCard = {
  title: string;
  surveyType: string;
  description: string;
  simpleMeaning: string;
  requiredFiles: string[];
  optionalFiles: string[];
  supportedFormats: string[];
  sampleLinks: SampleLink[];
  steps: string[];
  demoQuery: string;
  advancedDetails: string[];
};

export const helpTopics: HelpTopic[] = [
  {
    id: "start-here",
    title: "Start Here",
    shortTitle: "Start Here",
    summary: "A very simple first look at what this app does.",
    aiPrompt: "Explain the GeoSurvey AI app to a first-time non-technical user in very simple language."
  },
  {
    id: "how-this-app-works",
    title: "How This App Works",
    shortTitle: "App Flow",
    summary: "Learn the main flow from adding files to seeing results.",
    aiPrompt: "Explain the GeoSurvey workflow using simple steps and plain language."
  },
  {
    id: "first-project",
    title: "Do Your First Project",
    shortTitle: "First Project",
    summary: "Follow one clear path to finish your first task.",
    aiPrompt: "Teach a beginner how to do their first project in GeoSurvey AI step by step."
  },
  {
    id: "what-files-to-upload",
    title: "What Files To Upload",
    shortTitle: "Files To Upload",
    summary: "Understand what file belongs to each survey type.",
    aiPrompt: "Explain what files users should upload for each survey type in GeoSurvey AI."
  },
  {
    id: "sample-files",
    title: "Sample Files & Test Project",
    shortTitle: "Sample Files",
    summary: "Download safe sample files and test the platform without using real client data.",
    aiPrompt: "Explain how to use sample files and demo projects inside GeoSurvey AI."
  },
  {
    id: "see-data-on-map",
    title: "See Data on Map",
    shortTitle: "Map View",
    summary: "Understand what the map is showing and what colors mean.",
    aiPrompt: "Explain the GeoSurvey map view in simple language."
  },
  {
    id: "smart-check",
    title: "Understand Smart Check / AI Results",
    shortTitle: "Smart Check",
    summary: "Learn what the smart check means and how to react to it.",
    aiPrompt: "Explain GeoSurvey AI results and smart checks in beginner-friendly language."
  },
  {
    id: "real-examples",
    title: "Real Examples",
    shortTitle: "Examples",
    summary: "See simple real-world examples of what users upload and what they get back.",
    aiPrompt: "Give simple real examples of how GeoSurvey AI is used."
  },
  {
    id: "common-problems",
    title: "Common Problems",
    shortTitle: "Problems",
    summary: "Recover calmly when a file, map, or result does not look right.",
    aiPrompt: "Help a beginner fix common GeoSurvey AI problems using calm and simple language."
  },
  {
    id: "pro-tips",
    title: "Pro Tips",
    shortTitle: "Pro Tips",
    summary: "Use a few simple habits to stay organized and avoid mistakes.",
    aiPrompt: "Share the best simple pro tips for using GeoSurvey AI well."
  }
];

export const acceptedFileHelp = [
  "CSV for point lists",
  "JPG for photos",
  "TIFF or GeoTIFF for map images",
  "LAS or LAZ for 3D scan files",
  "DXF or SHP for land drawings",
  "PDF for notes or reports"
];

export const surveyLearningCards: SurveyLearningCard[] = [
  {
    title: "GNSS / GPS Points",
    surveyType: "GNSS",
    description: "Use this when you have a point list from a GPS or GNSS survey.",
    simpleMeaning: "This is a list of survey points with location and height values.",
    requiredFiles: ["Point list CSV with latitude and longitude"],
    optionalFiles: ["Boundary file such as DXF or SHP", "PDF field notes"],
    supportedFormats: ["CSV", "DXF", "SHP", "PDF"],
    sampleLinks: [
      { label: "Sample GNSS CSV", href: "/samples/sample-gnss-points.csv" },
      { label: "Sample Guide", href: "/samples/README.txt" }
    ],
    steps: ["Download the sample CSV.", "Create a project and task.", "Upload the CSV.", "Open the map and preview the points.", "Run Smart Check after processing."],
    demoQuery: "/jobs?createJob=1&demoType=GNSS_TRAVERSE&demoName=Demo%20GNSS%20Land%20Survey",
    advancedDetails: ["Best when each row has latitude, longitude, elevation, accuracy, and time.", "Use boundary files if you want the map to show a site outline."]
  },
  {
    title: "Drone",
    surveyType: "Drone",
    description: "Use this when you have photos from a drone flight and map images from drone work.",
    simpleMeaning: "This is a set of photos and map image files from the air.",
    requiredFiles: ["Drone photo or image set", "Map image such as TIFF or GeoTIFF"],
    optionalFiles: ["Boundary drawing", "PDF notes"],
    supportedFormats: ["JPG", "TIFF", "GEOTIFF", "DXF", "PDF"],
    sampleLinks: [
      { label: "Sample Drone Image", href: "/samples/sample-drone-image-01.jpg", note: "Light placeholder sample" },
      { label: "Sample Drone Map", href: "/samples/sample-drone-orthomosaic.tif", note: "Light placeholder sample" }
    ],
    steps: ["Download the sample photo and map image.", "Create a drone demo task.", "Upload both files.", "Check the map tab.", "Review Smart Check notes."],
    demoQuery: "/jobs?createJob=1&demoType=DRONE_PHOTOGRAMMETRY&demoName=Demo%20Drone%20Site%20Survey",
    advancedDetails: ["Photo sets can be large in real work.", "A map image helps the app show the survey area faster."]
  },
  {
    title: "LiDAR",
    surveyType: "LiDAR",
    description: "Use this when you have a 3D scan file from a laser or LiDAR workflow.",
    simpleMeaning: "This is a 3D scan file that stores many survey points in space.",
    requiredFiles: ["One LAS or LAZ scan file"],
    optionalFiles: ["Boundary file", "PDF notes"],
    supportedFormats: ["LAS", "LAZ", "DXF", "PDF"],
    sampleLinks: [
      { label: "Sample LAS File", href: "/samples/sample-lidar-cloud.las", note: "Placeholder training file" },
      { label: "Sample LAZ File", href: "/samples/sample-lidar-cloud.laz", note: "Placeholder training file" }
    ],
    steps: ["Download one sample LiDAR file.", "Create a LiDAR demo task.", "Upload the file.", "Start work.", "Review outputs and notes."],
    demoQuery: "/jobs?createJob=1&demoType=LIDAR&demoName=Demo%20LiDAR%20Review",
    advancedDetails: ["Real LiDAR files can be very large.", "Use the placeholder sample to learn the flow before using field data."]
  },
  {
    title: "Total Station",
    surveyType: "TOTAL_STATION",
    description: "Use this when you have measured points from a total station workflow.",
    simpleMeaning: "This is a point list from a ground survey instrument.",
    requiredFiles: ["Point list CSV"],
    optionalFiles: ["Boundary drawing", "PDF notes"],
    supportedFormats: ["CSV", "DXF", "PDF"],
    sampleLinks: [
      { label: "Sample Total Station CSV", href: "/samples/sample-total-station-points.csv" },
      { label: "Sample Boundary File", href: "/samples/sample-site-boundary.dxf", note: "Placeholder drawing file" }
    ],
    steps: ["Download the point list sample.", "Create a total station task.", "Upload the CSV.", "Upload the boundary file if needed.", "Review the map."],
    demoQuery: "/jobs?createJob=1&demoType=TOTAL_STATION&demoName=Demo%20Total%20Station%20Check",
    advancedDetails: ["Keep point IDs if you want easier row tracking.", "Boundary files help map review but are not always required."]
  },
  {
    title: "Hybrid",
    surveyType: "HYBRID",
    description: "Use this when you want to combine more than one data type in one task.",
    simpleMeaning: "This is mixed survey work, such as points plus drone images or a scan file plus a boundary file.",
    requiredFiles: ["At least two related files from different sources"],
    optionalFiles: ["Boundary file", "PDF notes", "Map image"],
    supportedFormats: ["CSV", "JPG", "TIFF", "LAS", "LAZ", "DXF", "PDF"],
    sampleLinks: [
      { label: "Hybrid Sample Guide", href: "/samples/sample-hybrid-readme.txt" },
      { label: "Sample Site Boundary", href: "/samples/sample-site-boundary.dxf", note: "Placeholder drawing file" }
    ],
    steps: ["Open the hybrid sample guide.", "Pick two sample files to upload together.", "Create a hybrid demo task.", "Upload files.", "Check map, files, and Smart Check together."],
    demoQuery: "/jobs?createJob=1&demoType=HYBRID&demoName=Demo%20Hybrid%20Review",
    advancedDetails: ["Hybrid work is useful when one file type alone does not tell the full story.", "Keep mixed files inside one task if they belong to the same site."]
  }
];

export const commonProblems = [
  {
    title: "A file is not uploading",
    problem: "The file may be too large, broken, or not supported here.",
    fix: "Try a sample file first. Then try CSV, LAS, LAZ, TIFF, SHP, DXF, PDF, or JPG."
  },
  {
    title: "The file type is wrong",
    problem: "This file type is not supported here.",
    fix: "Use the sample files page to download a working example and compare it to your own file."
  },
  {
    title: "Work is not starting",
    problem: "The task may not have a valid file yet.",
    fix: "Check the file list first. If there is no valid file, upload one sample file and try again."
  },
  {
    title: "The map is empty",
    problem: "The app may not have location data to show.",
    fix: "Upload a point list or map image file, then open the map tab again."
  },
  {
    title: "No Smart Check result",
    problem: "Smart Check often needs uploaded data or processed results first.",
    fix: "Upload files, start work, wait for progress, then open Smart Check again."
  },
  {
    title: "A sample file does not open",
    problem: "Some sample files are lightweight placeholders to teach the flow.",
    fix: "Read the sample guide and use the file to learn upload steps. Heavy real samples are not required to test the UI."
  }
];

export const realExamples = [
  {
    title: "Land measurement",
    uploads: ["GPS point list", "Boundary drawing"],
    appDoes: "Shows the land area and checks the uploaded survey data.",
    output: "Map view, cleaned files, and smart notes about data quality."
  },
  {
    title: "Construction site survey",
    uploads: ["Drone images", "Map image", "Point list"],
    appDoes: "Keeps the survey task organized and helps review progress data.",
    output: "Mapped site view, progress files, and Smart Check guidance."
  },
  {
    title: "Farm or land check",
    uploads: ["GPS points", "Boundary file"],
    appDoes: "Places the land data on the map and keeps it easy to review.",
    output: "Clear map location and simple review notes."
  },
  {
    title: "Road or route planning",
    uploads: ["Point list", "Map image", "Notes"],
    appDoes: "Groups route survey information into one task.",
    output: "Task status, map review, and output files for follow-up work."
  },
  {
    title: "Property boundary checking",
    uploads: ["Boundary drawing", "GPS points"],
    appDoes: "Shows where the boundary sits and helps check if anything needs review.",
    output: "Boundary map, file list, and Smart Check messages."
  }
];
