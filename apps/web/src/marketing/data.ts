export type MarketingFeature = {
  icon: "spark" | "layers" | "pulse" | "radar" | "map" | "report";
  title: string;
  description: string;
};

export const trustMetrics = [
  { value: "10k+", label: "survey files processed" },
  { value: "43%", label: "faster delivery cycles" },
  { value: "99.2%", label: "boundary review consistency" },
  { value: "< 15 min", label: "to first AI insights" }
];

export const coreFeatures: MarketingFeature[] = [
  {
    icon: "spark",
    title: "AI Survey Processing",
    description: "Turn raw field data into usable outputs faster with automated classification, validation, and analysis."
  },
  {
    icon: "layers",
    title: "GNSS & Drone Data Support",
    description: "Bring GNSS, UAV, LiDAR, and mixed survey inputs into one standardized workflow without tool switching."
  },
  {
    icon: "pulse",
    title: "Real-time Job Tracking",
    description: "Keep every survey visible with live processing status, blockers, and delivery readiness across teams."
  },
  {
    icon: "radar",
    title: "AI Insights & Recommendations",
    description: "Detect anomalies, missing coverage, and quality issues early so teams can fix problems before delivery."
  },
  {
    icon: "map",
    title: "Map & Boundary Visualization",
    description: "Review project extents, boundaries, and site context inside a clean spatial workspace built for decisions."
  },
  {
    icon: "report",
    title: "Automated Reports",
    description: "Generate polished reports, client-ready summaries, and boundary outputs without manual formatting work."
  }
];

export const useCases = [
  {
    title: "Construction",
    description: "Keep stakeout, verification, and progress surveys moving with faster turnaround from field capture to output."
  },
  {
    title: "Land Development",
    description: "Coordinate boundaries, topographic context, and project documentation across consultants and owners."
  },
  {
    title: "Infrastructure",
    description: "Standardize recurring survey operations across roads, utilities, corridors, and complex asset programs."
  },
  {
    title: "Government",
    description: "Improve review consistency, auditability, and delivery speed for public land and mapping workflows."
  },
  {
    title: "Survey Firms",
    description: "Increase throughput without growing overhead by centralizing intake, processing, quality review, and reporting."
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
