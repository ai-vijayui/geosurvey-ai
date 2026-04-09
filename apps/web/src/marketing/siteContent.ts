export type CommandExample = {
  prompt: string;
  actions: string[];
  result: string;
};

export type FeaturePage = {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  aiSolution: string;
  outputPreview: string;
  command: CommandExample;
  relatedUseCases: string[];
  relatedBlogSlugs: string[];
};

export type UseCasePage = {
  slug: string;
  title: string;
  audience: string;
  painPoints: string[];
  traditionalWorkflow: string[];
  aiWorkflow: string[];
  result: string;
  featureSlugs: string[];
};

export type BlogArticle = {
  slug: string;
  title: string;
  category: "industry-insights" | "tutorials" | "product-updates";
  categoryLabel: string;
  excerpt: string;
  readTime: string;
  command: CommandExample;
  relatedFeatureSlug: string;
  relatedArticleSlugs: string[];
  body: string[];
};

export type ResourcePage = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  items: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  }[];
  relatedFeatureSlug?: string;
  relatedUseCaseSlug?: string;
  command?: CommandExample;
};

export const commandExamples: CommandExample[] = [
  {
    prompt: "Create a survey project for 5 hectares",
    actions: ["Creates project", "Sets up job", "Prepares workflow"],
    result: "Project ready"
  },
  {
    prompt: "Upload and process GNSS data for Lot 24",
    actions: ["Validates files", "Maps points to the job", "Starts processing"],
    result: "GNSS workflow running"
  },
  {
    prompt: "Generate a boundary report for East Parcel",
    actions: ["Finds the project", "Runs review checks", "Builds the report package"],
    result: "Boundary report ready for review"
  }
];

export const featurePages: FeaturePage[] = [
  {
    slug: "ai-command-center",
    title: "AI Command Center",
    summary: "Run the entire platform with natural instructions instead of manual setup screens.",
    problem: "Survey teams lose time switching between project creation, job setup, processing controls, and reporting steps.",
    aiSolution: "GeoSurvey AI lets operators issue a single instruction and have the platform create projects, launch jobs, process data, and prepare deliverables automatically.",
    outputPreview: "Project created, workflow staged, processing launched, and next actions returned in one assistant panel.",
    command: commandExamples[0],
    relatedUseCases: ["land-surveyors", "construction-companies"],
    relatedBlogSlugs: ["how-ai-shortens-the-path-from-survey-upload-to-deliverable", "how-to-use-ai-commands-for-survey-project-setup"]
  },
  {
    slug: "automated-survey-processing",
    title: "Automated Survey Processing",
    summary: "Move from upload to processed job state with AI orchestrating the routine steps.",
    problem: "Manual survey processing creates delays, context switching, and inconsistent delivery speed across projects.",
    aiSolution: "Use AI commands to start processing workflows, validate sources, and move the job forward without manual coordination overhead.",
    outputPreview: "Uploads are validated, processing begins, and status is visible from one command-driven workflow.",
    command: commandExamples[1],
    relatedUseCases: ["drone-mapping-teams", "infrastructure-teams"],
    relatedBlogSlugs: ["how-ai-shortens-the-path-from-survey-upload-to-deliverable", "improving-qa-for-drone-gnss-and-lidar-projects-with-ai-review"]
  },
  {
    slug: "gnss-data-handling",
    title: "GNSS Data Handling",
    summary: "Import GNSS CSV data and standardize intake without forcing teams into manual cleanup loops.",
    problem: "GNSS imports often create repeat formatting work and inconsistent intake quality before analysis even starts.",
    aiSolution: "AI commands let teams import, map, and process GNSS data with structured workflow setup and fewer repetitive steps.",
    outputPreview: "GNSS files attached to the right job, ready for processing and downstream review.",
    command: commandExamples[1],
    relatedUseCases: ["land-surveyors", "gis-professionals"],
    relatedBlogSlugs: ["gnss-csv-import-best-practices-for-ai-first-survey-workflows", "how-ai-shortens-the-path-from-survey-upload-to-deliverable"]
  },
  {
    slug: "map-visualization",
    title: "Map & Visualization",
    summary: "Review boundaries, extents, and outputs in map context directly from the AI-led workflow.",
    problem: "Teams often need another tool or another step just to understand spatial outputs clearly.",
    aiSolution: "AI can route teams straight into the relevant map review context, helping them inspect the right job, boundary, or anomaly faster.",
    outputPreview: "Map view opens with the correct project context, highlighted review areas, and linked outputs.",
    command: {
      prompt: "Open the map review for North Parcel and highlight boundary issues",
      actions: ["Finds the correct job", "Loads map context", "Highlights likely issue areas"],
      result: "Map review ready"
    },
    relatedUseCases: ["government-agencies", "boundary-review-teams"],
    relatedBlogSlugs: ["improving-qa-for-drone-gnss-and-lidar-projects-with-ai-review", "how-map-based-review-improves-boundary-workflows"]
  },
  {
    slug: "ai-insights-reports",
    title: "AI Insights & Reports",
    summary: "Surface issues sooner and generate reports through the same assistant-led workflow.",
    problem: "Issues are often discovered too late and reporting still becomes a separate manual deliverable task.",
    aiSolution: "AI can flag likely problems, guide review attention, and generate report-ready outputs from natural instructions.",
    outputPreview: "Insight summaries, review recommendations, and report packages are created from one command path.",
    command: commandExamples[2],
    relatedUseCases: ["boundary-review-teams", "government-agencies"],
    relatedBlogSlugs: ["improving-qa-for-drone-gnss-and-lidar-projects-with-ai-review", "how-to-generate-boundary-reports-with-ai-commands"]
  }
];

export const useCasePages: UseCasePage[] = [
  {
    slug: "land-surveyors",
    title: "For Land Surveyors",
    audience: "Land survey companies",
    painPoints: ["Too much manual setup", "Slow report delivery", "Disconnected project and job tracking"],
    traditionalWorkflow: ["Create project manually", "Set up job context", "Upload and process in separate steps", "Assemble outputs later"],
    aiWorkflow: ["Tell AI what project to create", "AI creates job and workflow", "AI processes survey inputs", "AI prepares outputs and reporting"],
    result: "Faster throughput with less operational drag.",
    featureSlugs: ["ai-command-center", "automated-survey-processing", "gnss-data-handling"]
  },
  {
    slug: "construction-companies",
    title: "For Construction Companies",
    audience: "Construction survey teams",
    painPoints: ["Projects move fast", "Review delays hurt schedules", "Field-to-office coordination is expensive"],
    traditionalWorkflow: ["Collect data", "Wait for setup", "Process across tools", "Report later"],
    aiWorkflow: ["Issue instruction", "AI prepares project workflow", "AI processes the data", "Outputs are ready sooner"],
    result: "Survey tasks move faster inside the construction delivery timeline.",
    featureSlugs: ["ai-command-center", "automated-survey-processing", "map-visualization"]
  },
  {
    slug: "government-agencies",
    title: "For Government Agencies",
    audience: "Public land and mapping departments",
    painPoints: ["Need review consistency", "Need traceable workflows", "Need defensible outputs"],
    traditionalWorkflow: ["Manual setup", "Manual QA", "Slow boundary review", "Reporting handled separately"],
    aiWorkflow: ["AI creates the review context", "AI highlights likely anomalies", "Teams review in map context", "Reports are generated consistently"],
    result: "Better auditability and more standardized review.",
    featureSlugs: ["map-visualization", "ai-insights-reports", "ai-command-center"]
  },
  {
    slug: "gis-professionals",
    title: "For GIS Professionals",
    audience: "GIS and geospatial analysts",
    painPoints: ["Messy input workflows", "Disconnected review tools", "Too much repetitive setup"],
    traditionalWorkflow: ["Prepare files manually", "Load the right context", "Review separately", "Create outputs later"],
    aiWorkflow: ["Tell AI the task", "AI sets up intake and review", "AI surfaces issues", "Outputs are prepared from the same workflow"],
    result: "Cleaner geospatial operations with less context switching.",
    featureSlugs: ["gnss-data-handling", "map-visualization", "ai-insights-reports"]
  },
  {
    slug: "boundary-review-teams",
    title: "For Boundary Review Teams",
    audience: "Cadastral and boundary review workflows",
    painPoints: ["Slow issue detection", "Boundary checks take too long", "Reports are repetitive to produce"],
    traditionalWorkflow: ["Find the right project", "Review boundaries manually", "Compile reporting separately"],
    aiWorkflow: ["Ask AI to open the review workflow", "AI highlights likely overlaps and risks", "AI prepares the report package"],
    result: "Faster boundary checks and more consistent outputs.",
    featureSlugs: ["map-visualization", "ai-insights-reports", "ai-command-center"]
  },
  {
    slug: "drone-mapping-teams",
    title: "For Drone Mapping Teams",
    audience: "Drone mapping operations",
    painPoints: ["Data handoff delays", "Too many manual processing steps", "Hard to keep job status visible"],
    traditionalWorkflow: ["Transfer data", "Set up processing", "Review in another step", "Deliver later"],
    aiWorkflow: ["Tell AI to create the job", "AI launches processing", "AI guides review", "Outputs are packaged faster"],
    result: "A faster path from capture to reviewed deliverables.",
    featureSlugs: ["automated-survey-processing", "map-visualization", "ai-command-center"]
  }
];

export const blogArticles: BlogArticle[] = [
  {
    slug: "how-ai-shortens-the-path-from-survey-upload-to-deliverable",
    title: "How AI shortens the path from survey upload to deliverable",
    category: "industry-insights",
    categoryLabel: "Industry Insights",
    excerpt: "A practical look at where automation removes repetitive work in modern land surveying teams.",
    readTime: "6 min read",
    command: commandExamples[1],
    relatedFeatureSlug: "automated-survey-processing",
    relatedArticleSlugs: ["how-to-use-ai-commands-for-survey-project-setup", "gnss-csv-import-best-practices-for-ai-first-survey-workflows"],
    body: [
      "Most survey workflow delays are not caused by one big technical issue. They are caused by dozens of small setup steps, repeated checks, and disconnected handoffs that accumulate across projects.",
      "An AI-first workflow changes that by letting the user express intent first. Instead of creating a project, then a job, then linking data, then launching processing, the operator can tell the system what they need and let the platform do the setup work.",
      "That changes the user experience from tool operation to workflow direction. For teams managing multiple jobs at once, the reduction in operational drag is often more valuable than raw processing speed alone."
    ]
  },
  {
    slug: "how-to-use-ai-commands-for-survey-project-setup",
    title: "How to use AI commands for survey project setup",
    category: "tutorials",
    categoryLabel: "Tutorials",
    excerpt: "A step-by-step tutorial for creating projects, jobs, and workflow context with natural instructions.",
    readTime: "5 min read",
    command: commandExamples[0],
    relatedFeatureSlug: "ai-command-center",
    relatedArticleSlugs: ["how-ai-shortens-the-path-from-survey-upload-to-deliverable", "how-to-generate-boundary-reports-with-ai-commands"],
    body: [
      "The fastest way to understand an AI-first platform is to start with a project creation command. Instead of navigating setup forms manually, the operator describes the desired outcome and lets the system build the correct operational structure.",
      "This approach is especially useful for repeatable workflows where teams already know the kind of project, job type, and output path they need. AI removes the repetitive setup work while keeping the result visible and reviewable.",
      "The most effective command patterns include the survey type, site context, and intended output so the platform can prepare the right workflow immediately."
    ]
  },
  {
    slug: "gnss-csv-import-best-practices-for-ai-first-survey-workflows",
    title: "GNSS CSV import best practices for AI-first survey workflows",
    category: "tutorials",
    categoryLabel: "Tutorials",
    excerpt: "How to keep GNSS data handling structured when AI is controlling project and job setup.",
    readTime: "7 min read",
    command: commandExamples[1],
    relatedFeatureSlug: "gnss-data-handling",
    relatedArticleSlugs: ["how-ai-shortens-the-path-from-survey-upload-to-deliverable", "improving-qa-for-drone-gnss-and-lidar-projects-with-ai-review"],
    body: [
      "GNSS workflows benefit from AI most when the input path is predictable. Clear file naming, project context, and intended processing instructions help the platform assign the right data to the right job faster.",
      "The AI-first model is not about hiding all structure. It is about reducing the amount of repeated setup a human must perform while preserving quality and reviewability.",
      "For many teams, AI-guided GNSS intake means fewer import mistakes, faster processing starts, and less time spent on repetitive formatting corrections."
    ]
  },
  {
    slug: "improving-qa-for-drone-gnss-and-lidar-projects-with-ai-review",
    title: "Improving QA for drone, GNSS, and LiDAR projects with AI review",
    category: "industry-insights",
    categoryLabel: "Industry Insights",
    excerpt: "How earlier issue detection helps teams reduce rework and protect project margins.",
    readTime: "7 min read",
    command: {
      prompt: "Analyze accuracy and flag likely review risks for this boundary job",
      actions: ["Checks workflow status", "Highlights probable issues", "Returns review guidance"],
      result: "QA review priorities ready"
    },
    relatedFeatureSlug: "ai-insights-reports",
    relatedArticleSlugs: ["how-map-based-review-improves-boundary-workflows", "how-to-generate-boundary-reports-with-ai-commands"],
    body: [
      "AI-assisted review works best when it helps teams focus their attention. In survey QA, that means surfacing likely overlap risks, missing coverage, or suspicious areas earlier in the workflow.",
      "The value is not that AI replaces expert review. The value is that it changes the order of work so likely issues are discovered sooner and teams spend less time searching blindly.",
      "That becomes especially valuable in mixed-data workflows involving drone capture, GNSS imports, and LiDAR review, where context switching can otherwise slow teams down."
    ]
  },
  {
    slug: "how-map-based-review-improves-boundary-workflows",
    title: "How map-based review improves boundary workflows",
    category: "product-updates",
    categoryLabel: "Product Updates",
    excerpt: "Why spatial review context is critical when AI is helping manage survey operations.",
    readTime: "4 min read",
    command: {
      prompt: "Open boundary review for Project Delta and show likely overlap areas",
      actions: ["Loads the right project", "Opens map review", "Highlights issue zones"],
      result: "Boundary review in map context"
    },
    relatedFeatureSlug: "map-visualization",
    relatedArticleSlugs: ["improving-qa-for-drone-gnss-and-lidar-projects-with-ai-review", "how-to-generate-boundary-reports-with-ai-commands"],
    body: [
      "Boundary work is easier to trust when teams can inspect outputs in spatial context. A map-based review flow makes anomalies easier to understand and reduces ambiguity during QA.",
      "When AI is part of the workflow, map context becomes even more important because it helps users validate what the system is doing and why certain issues were flagged.",
      "That makes the experience feel less like a black box and more like a guided workflow with clear visual evidence."
    ]
  },
  {
    slug: "how-to-generate-boundary-reports-with-ai-commands",
    title: "How to generate boundary reports with AI commands",
    category: "tutorials",
    categoryLabel: "Tutorials",
    excerpt: "Use AI instructions to move from reviewed work to output-ready boundary reports faster.",
    readTime: "5 min read",
    command: commandExamples[2],
    relatedFeatureSlug: "ai-insights-reports",
    relatedArticleSlugs: ["how-to-use-ai-commands-for-survey-project-setup", "how-map-based-review-improves-boundary-workflows"],
    body: [
      "Report generation is one of the clearest examples of AI reducing repetitive work. The operator knows what output is needed, and the platform can assemble the right reporting path automatically.",
      "The key is that reporting remains connected to the job workflow. That means teams do not lose context or rebuild the deliverable process manually at the end.",
      "An AI command for reporting should reference the project, output type, and review state so the system can generate the right package with minimal manual effort."
    ]
  }
];

export const resourcePages: ResourcePage[] = [
  {
    slug: "guides",
    eyebrow: "Guides",
    title: "Practical guides for AI-first survey operations",
    summary: "Implementation-ready guides that help teams understand how to move from manual setup to AI-directed workflows.",
    description: "These guides explain how GeoSurvey AI fits into real intake, processing, review, and reporting workflows so evaluation turns into action faster.",
    command: commandExamples[0],
    relatedFeatureSlug: "ai-command-center",
    relatedUseCaseSlug: "land-surveyors",
    items: [
      {
        title: "Guide: Launch a new survey project with one instruction",
        description: "Show teams how AI creates the project, job context, and workflow setup automatically.",
        ctaLabel: "See AI Command Center",
        ctaHref: "/ai-command-center"
      },
      {
        title: "Guide: Move from upload to reviewed output faster",
        description: "Map the handoff from file intake to processing, QA, and reporting with less manual coordination.",
        ctaLabel: "Explore Features",
        ctaHref: "/features"
      },
      {
        title: "Guide: Standardize survey delivery across teams",
        description: "Help operations leaders create more consistent workflows across projects and deliverables.",
        ctaLabel: "View Pricing",
        ctaHref: "/pricing"
      }
    ]
  },
  {
    slug: "case-studies",
    eyebrow: "Case Studies",
    title: "Operational outcomes teams can recognize quickly",
    summary: "Illustrative stories that show where AI-first surveying improves delivery speed, clarity, and review consistency.",
    description: "These stories are designed to help prospects map GeoSurvey AI to their own workflow pressure points and evaluation criteria.",
    command: commandExamples[1],
    relatedFeatureSlug: "automated-survey-processing",
    relatedUseCaseSlug: "construction-companies",
    items: [
      {
        title: "Survey firm: cut setup time across concurrent jobs",
        description: "Show how AI-driven project creation removed repeated setup work from the office workflow.",
        ctaLabel: "See the related feature",
        ctaHref: "/features/automated-survey-processing"
      },
      {
        title: "Infrastructure team: improve job visibility",
        description: "Explain how managers gained faster visibility into what was processing, blocked, and ready.",
        ctaLabel: "Explore use cases",
        ctaHref: "/solutions"
      },
      {
        title: "Boundary review team: shorten reporting cycles",
        description: "Walk through how AI-guided review and reporting reduced repetitive reporting overhead.",
        ctaLabel: "Try AI Demo",
        ctaHref: "/demo"
      }
    ]
  },
  {
    slug: "sample-data-files",
    eyebrow: "Sample Data",
    title: "Sample files and workflow inputs for evaluation",
    summary: "Structured examples that help technical evaluators picture how their own GNSS, drone, and review workflows would fit.",
    description: "Sample data pages reduce onboarding friction by showing the kinds of inputs, workflow states, and outputs the platform is designed around.",
    command: commandExamples[1],
    relatedFeatureSlug: "gnss-data-handling",
    relatedUseCaseSlug: "gis-professionals",
    items: [
      {
        title: "GNSS CSV sample package",
        description: "Show how AI maps uploaded survey points to the right project and processing workflow.",
        ctaLabel: "Explore GNSS feature",
        ctaHref: "/features/gnss-data-handling"
      },
      {
        title: "Boundary review sample project",
        description: "Illustrate how map review, issue highlighting, and reports fit into one AI-directed workflow.",
        ctaLabel: "See boundary workflow",
        ctaHref: "/use-cases/boundary-review-teams"
      },
      {
        title: "Mixed survey input checklist",
        description: "Help teams understand what makes file intake smoother and faster at the start of a job.",
        ctaLabel: "Browse docs",
        ctaHref: "/docs"
      }
    ]
  },
  {
    slug: "prompt-library",
    eyebrow: "Prompt Library",
    title: "AI command examples teams can reuse immediately",
    summary: "Prompt patterns that make the AI-first product model clear in seconds: instruction in, workflow moves forward.",
    description: "This page is one of the strongest conversion bridges on the site because it turns abstract AI messaging into specific commands and visible outcomes.",
    command: commandExamples[2],
    relatedFeatureSlug: "ai-insights-reports",
    relatedUseCaseSlug: "government-agencies",
    items: [
      {
        title: "Project creation prompts",
        description: "Examples for creating a survey project, assigning context, and preparing the first workflow step.",
        ctaLabel: "Start Free",
        ctaHref: "/sign-up"
      },
      {
        title: "Processing and QA prompts",
        description: "Examples for launching GNSS workflows, reviewing job status, and asking AI to prioritize issues.",
        ctaLabel: "Try AI Demo",
        ctaHref: "/demo"
      },
      {
        title: "Reporting prompts",
        description: "Examples for generating reports, summarizing insights, and preparing outputs for delivery.",
        ctaLabel: "Open AI Command Center",
        ctaHref: "/ai-command-center"
      }
    ]
  }
];
