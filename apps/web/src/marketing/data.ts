export type MarketingFeature = {
  icon: "spark" | "layers" | "pulse" | "radar" | "map" | "report";
  title: string;
  description: string;
};

export type MarketingFaq = {
  question: string;
  answer: string;
};

export const trustMetrics = [
  { value: "10k+", label: "survey files processed" },
  { value: "43%", label: "faster delivery cycles" },
  { value: "99.2%", label: "boundary review consistency" },
  { value: "< 15 min", label: "to first AI insights" }
];

export const supportedDataTypes = ["GNSS CSV", "Drone mapping", "LiDAR", "Survey job files", "Reports", "Boundary outputs"];

export const coreFeatures: MarketingFeature[] = [
  {
    icon: "pulse",
    title: "Survey Job Management",
    description: "Organize active survey work by project, track job status, and give operations leads a live view of what is moving."
  },
  {
    icon: "layers",
    title: "File Upload and Validation",
    description: "Bring field files into one intake flow, validate the package early, and reduce downstream delays caused by incomplete inputs."
  },
  {
    icon: "spark",
    title: "GNSS CSV Import",
    description: "Import GNSS point data with a structured workflow that makes survey intake cleaner, faster, and more repeatable."
  },
  {
    icon: "map",
    title: "Map-Based Review",
    description: "Review boundaries, project extents, and output context inside a spatial interface built for actual geospatial decisions."
  },
  {
    icon: "radar",
    title: "AI Survey Insights",
    description: "Surface overlap risks, missing coverage, and review guidance earlier so teams catch issues before delivery."
  },
  {
    icon: "report",
    title: "Reports, Exports, and Outputs",
    description: "Generate reports and output files from the same operational workflow so delivery stays consistent and easier to manage."
  }
];

export const detailedFeatures = [
  {
    ...coreFeatures[0],
    value: "Gives project leads and operations managers one system to track intake, progress, blockers, and delivery readiness.",
    objection: "Removes the fear that teams will still need spreadsheets or disconnected job trackers."
  },
  {
    ...coreFeatures[1],
    value: "Reduces bad handoffs by catching missing or inconsistent data before processing starts.",
    objection: "Answers the concern that setup and file intake will still be messy."
  },
  {
    ...coreFeatures[2],
    value: "Standardizes how GNSS data enters the workflow so teams spend less time cleaning imports.",
    objection: "Helps technical buyers trust that real survey datasets fit the platform."
  },
  {
    ...coreFeatures[3],
    value: "Lets teams inspect work where geospatial decisions actually happen instead of relying on blind tabular review.",
    objection: "Removes the need for a separate review tool just to validate outputs."
  },
  {
    ...coreFeatures[4],
    value: "Shortens QA cycles by directing attention to likely issues first without taking control away from operators.",
    objection: "Makes the AI useful and credible instead of vague or overclaimed."
  },
  {
    ...coreFeatures[5],
    value: "Connects final delivery to the same workflow that created it, improving consistency and accountability.",
    objection: "Resolves the worry that reporting still happens manually outside the platform."
  }
];

export const useCases = [
  {
    title: "Land Survey Companies",
    description: "Increase throughput across concurrent jobs without adding more operational overhead."
  },
  {
    title: "Drone Mapping Teams",
    description: "Move from capture to review and output with less friction between data processing and delivery."
  },
  {
    title: "GIS Analysts",
    description: "Work with cleaner intake, map-based context, and more predictable operational workflows."
  },
  {
    title: "Infrastructure Teams",
    description: "Standardize recurring survey operations across roads, corridors, utilities, and complex asset programs."
  },
  {
    title: "Boundary Review Workflows",
    description: "Improve review consistency, anomaly detection, and reporting across cadastral and land-management work."
  }
];

export const platformModules = [
  {
    label: "Operations dashboard",
    title: "See live work across projects, jobs, reports, and review queues.",
    description: "Portfolio-level visibility helps teams understand what is queued, what is blocked, and what is ready to deliver."
  },
  {
    label: "Survey jobs",
    title: "Give every survey a structured workflow from intake through review.",
    description: "Job-level organization keeps uploads, outputs, insights, and reporting tied to the right operational context."
  },
  {
    label: "GNSS and input flows",
    title: "Standardize field data intake across different sources and file types.",
    description: "Bring GNSS, drone, LiDAR, and supporting files into a cleaner process before deeper work starts."
  },
  {
    label: "Map and AI review",
    title: "Review outputs in spatial context and focus QA attention faster.",
    description: "Map-based inspection and AI-assisted issue detection reduce the time spent hunting for risk manually."
  }
];

export const whyChooseUs = [
  "Built for survey operations, not generic task management",
  "Real workflow visibility for project leads and delivery teams",
  "AI that supports QA and review instead of replacing human judgment",
  "Output and reporting workflows connected to the same operational system"
];

export const aiInsightBullets = [
  "Flag likely overlaps, missing coverage, and review risks earlier",
  "Highlight jobs that need attention before delivery",
  "Support operators with recommendations while keeping review human-controlled"
];

export const featureComparisonRows = [
  {
    capability: "Project and survey job tracking",
    geoSurvey: "Built into the workflow",
    fragmented: "Handled across spreadsheets and separate tools"
  },
  {
    capability: "GNSS and mixed data intake",
    geoSurvey: "Structured import and validation",
    fragmented: "Manual setup and repeated cleanup"
  },
  {
    capability: "Map-based review and QA",
    geoSurvey: "Native review context",
    fragmented: "Often requires another review step"
  },
  {
    capability: "AI issue detection",
    geoSurvey: "Supports QA and prioritization",
    fragmented: "Mostly manual review"
  },
  {
    capability: "Reports and output generation",
    geoSurvey: "Connected to job workflow",
    fragmented: "Often assembled outside the system"
  }
];

export const testimonials = [
  {
    quote: "GeoSurvey AI cut the handoff time between field crews and office processing dramatically. We spend less time stitching tools together and more time shipping clean deliverables.",
    name: "Alicia Moreno",
    role: "Director of Survey Operations",
    company: "Northline Geomatics"
  },
  {
    quote: "The biggest win is clarity. Project leads can see what is processing, what needs review, and what is ready for issue without chasing updates across teams.",
    name: "Rohan Patel",
    role: "Infrastructure Delivery Manager",
    company: "Civic Terrain Group"
  },
  {
    quote: "We needed enterprise-grade control with a modern workflow. GeoSurvey AI gave us both while making complex geospatial work easier to explain internally.",
    name: "Emily Chen",
    role: "GIS Program Lead",
    company: "Western Land Systems"
  }
];

export const pricingTiers = [
  {
    name: "Basic",
    price: "$99",
    description: "For smaller teams validating a faster AI-assisted survey workflow.",
    cta: "Get Started",
    highlighted: false,
    features: ["1 workspace", "Core AI processing", "Standard exports", "Email support"]
  },
  {
    name: "Pro",
    price: "$299",
    description: "For growing survey and engineering teams managing active jobs every week.",
    cta: "Start Free Trial",
    highlighted: true,
    features: ["Unlimited active jobs", "Drone + GNSS support", "AI insights and QA flags", "Automated reporting"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-team operations that need governance, scale, and procurement-ready deployment.",
    cta: "Book Demo",
    highlighted: false,
    features: ["SSO and access controls", "Shared project governance", "Priority onboarding", "Custom procurement support"]
  }
];

export const blogPosts = [
  {
    title: "How AI shortens the path from survey upload to deliverable",
    excerpt: "A practical look at where automation removes repetitive work in modern land surveying teams.",
    category: "Operations",
    readTime: "6 min read"
  },
  {
    title: "What survey managers need from a production-ready geospatial platform",
    excerpt: "The systems, controls, and workflow visibility that matter when teams scale beyond ad hoc processing.",
    category: "Product",
    readTime: "5 min read"
  },
  {
    title: "Improving QA for drone, GNSS, and LiDAR projects with AI review",
    excerpt: "How earlier issue detection helps teams reduce rework and protect project margins.",
    category: "AI Insights",
    readTime: "7 min read"
  }
];

export const faqItems: MarketingFaq[] = [
  {
    question: "What types of survey data can GeoSurvey AI handle?",
    answer: "GeoSurvey AI is designed for GNSS, drone, LiDAR, and related survey workflow inputs, along with the review, reporting, and output steps around them."
  },
  {
    question: "Is this just an AI layer or a full product?",
    answer: "It is a full operational platform with dashboard views, survey jobs, file intake, GNSS import, map review, AI insights, reporting, and settings."
  },
  {
    question: "What does the AI actually do?",
    answer: "The AI helps surface risks, anomalies, and workflow insights that support faster QA and review. Human teams stay in control of decisions and final delivery."
  },
  {
    question: "Can project managers and operations leads use it too?",
    answer: "Yes. GeoSurvey AI is designed for both operators doing the work and managers who need visibility into project status, blockers, and outputs."
  },
  {
    question: "Does the platform support final reports and exports?",
    answer: "Yes. Reports, exports, and output generation are part of the workflow so delivery does not break away into another disconnected system."
  },
  {
    question: "How should a team start evaluating it?",
    answer: "The best next step is a workflow-focused demo so your team can see how GeoSurvey AI fits your actual survey process, data types, and reporting needs."
  }
];

export const docsSections = [
  {
    title: "Getting started",
    items: ["Create a project workspace", "Launch your first survey job", "Understand the dashboard and status views"]
  },
  {
    title: "Data intake",
    items: ["Upload and validate survey files", "Import GNSS CSV data", "Prepare mixed geospatial inputs"]
  },
  {
    title: "Review and delivery",
    items: ["Review work on the map", "Use AI insights for QA", "Generate reports and export outputs"]
  }
];

export const legalSummaries = {
  privacy: "GeoSurvey AI uses clear privacy language, operationally focused data handling, and transparent collection practices appropriate for B2B software evaluation.",
  terms: "Terms should explain account use, evaluation rights, subscription obligations, and acceptable product usage in straightforward enterprise-ready language.",
  security: "Security messaging should emphasize controlled access, operational visibility, and the steps larger teams expect before procurement or rollout."
};
