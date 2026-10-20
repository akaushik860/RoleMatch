// Curated skills dictionary. Each line: "Display Name|alias|alias".
// Grouped by domain (used for the job/resume mismatch warning) and category
// (used to pick which skills group a new skill goes into).

export type Domain =
  | "tech"
  | "product"
  | "design"
  | "marketing"
  | "sales"
  | "finance"
  | "hr"
  | "operations"
  | "general";

export const DOMAIN_LABEL: Record<Domain, string> = {
  tech: "Software / Data / Cloud",
  product: "Product Management",
  design: "Design",
  marketing: "Marketing",
  sales: "Sales",
  finance: "Finance & Accounting",
  hr: "HR & Recruiting",
  operations: "Operations & Supply Chain",
  general: "General",
};

interface Group {
  domain: Domain;
  category: string;
  terms: string[];
}

const GROUPS: Group[] = [
  {
    domain: "tech",
    category: "languages",
    terms: [
      "Python", "Java", "JavaScript|js|ecmascript", "TypeScript|ts", "C++|cpp", "C#|csharp|c sharp",
      "Go|golang", "Rust", "Ruby", "PHP", "Kotlin", "Swift", "Scala", "SQL", "Bash|shell scripting",
      "HTML|html5", "CSS|css3", "Dart", "Elixir", "MATLAB", "Solidity", "Objective-C",
    ],
  },
  {
    domain: "tech",
    category: "frameworks",
    terms: [
      "React|react.js|reactjs", "Next.js|nextjs", "Vue|vue.js|vuejs", "Angular|angularjs", "Svelte",
      "Node.js|nodejs|node", "Express|express.js", "NestJS", "Django", "Flask", "FastAPI",
      "Spring Boot|spring", "Ruby on Rails|rails", "Laravel", ".NET|dotnet|asp.net", "React Native",
      "Flutter", "Tailwind CSS|tailwind", "Redux", "GraphQL", "gRPC", "REST API|rest apis|restful|rest",
      "Microservices|microservice", "jQuery",
    ],
  },
  {
    domain: "tech",
    category: "cloud",
    terms: [
      "AWS|amazon web services", "Azure|microsoft azure", "GCP|google cloud|google cloud platform",
      "Docker", "Kubernetes|k8s", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
      "GitLab CI", "CI/CD|ci cd|continuous integration|continuous delivery", "Linux", "Nginx",
      "Serverless", "AWS Lambda|lambda", "EC2", "S3", "CloudFormation", "Helm", "Prometheus",
      "Grafana", "Datadog", "DevOps", "SRE|site reliability", "Infrastructure as Code|iac",
      "Observability", "Vercel", "Firebase", "Cloudflare",
    ],
  },
  {
    domain: "tech",
    category: "data",
    terms: [
      "PostgreSQL|postgres", "MySQL", "MongoDB|mongo", "Redis", "Elasticsearch", "DynamoDB",
      "Cassandra", "Snowflake", "BigQuery", "Redshift", "Databricks", "Apache Spark|spark|pyspark",
      "Kafka|apache kafka", "Airflow|apache airflow", "dbt", "ETL|elt", "Data Pipelines|data pipeline",
      "Data Warehouse|data warehousing", "Pandas", "NumPy", "scikit-learn|sklearn", "TensorFlow",
      "PyTorch", "Machine Learning|ml", "Deep Learning", "NLP|natural language processing",
      "Computer Vision", "LLM|llms|large language models", "Generative AI|genai|gen ai",
      "RAG|retrieval augmented generation", "Statistics", "A/B Testing|ab testing|a/b tests",
      "Tableau", "Power BI|powerbi", "Looker", "Data Analysis|data analytics", "Data Visualization",
      "Excel|microsoft excel|ms excel", "Hadoop", "Jupyter",
    ],
  },
  {
    domain: "tech",
    category: "tools",
    terms: [
      "Git", "GitHub", "Jira", "Postman", "Webpack", "Vite", "Jest", "Cypress", "Playwright",
      "Selenium", "Unit Testing|unit tests", "TDD|test driven development", "System Design",
      "Distributed Systems", "Data Structures", "Algorithms", "OOP|object oriented programming",
      "Security|application security", "OAuth", "Agile", "Scrum", "Code Review|code reviews",
      "Performance Optimization", "Caching", "WebSockets", "Mobile Development", "iOS", "Android",
    ],
  },
  {
    domain: "product",
    category: "product",
    terms: [
      "Product Management", "Product Roadmap|roadmap|roadmapping", "Product Strategy",
      "User Research", "PRD|product requirements", "Go-to-Market|gtm|go to market", "OKRs|okr",
      "KPIs|kpi", "Stakeholder Management|stakeholders", "Prioritization", "Market Research",
      "Customer Discovery", "Product Analytics", "Amplitude", "Mixpanel", "User Stories",
      "Backlog Management|backlog", "Experimentation", "Product Lifecycle",
    ],
  },
  {
    domain: "design",
    category: "design",
    terms: [
      "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "UI Design|ui", "UX Design|ux",
      "Wireframing|wireframes", "Prototyping|prototypes", "Design Systems|design system",
      "Usability Testing", "Interaction Design", "Visual Design", "Accessibility|wcag|a11y",
      "User Flows", "Information Architecture",
    ],
  },
  {
    domain: "marketing",
    category: "marketing",
    terms: [
      "SEO|search engine optimization", "SEM", "Google Ads|adwords", "Google Analytics|ga4",
      "Content Marketing", "Email Marketing", "Social Media|social media marketing",
      "Performance Marketing", "Paid Media|paid social", "HubSpot", "Marketo", "Mailchimp",
      "Brand Management|branding", "Copywriting", "Campaign Management|campaigns",
      "Marketing Automation", "Conversion Rate Optimization|cro", "Growth Marketing",
      "Demand Generation|demand gen", "Lead Generation|lead gen", "Meta Ads|facebook ads",
      "Influencer Marketing", "Public Relations",
    ],
  },
  {
    domain: "sales",
    category: "sales",
    terms: [
      "Salesforce|sfdc", "CRM", "B2B Sales|b2b", "B2C", "SaaS Sales", "Account Management",
      "Business Development", "Cold Calling", "Prospecting", "Pipeline Management|sales pipeline",
      "Negotiation", "Quota|quota attainment", "Lead Qualification", "Customer Success",
      "Upselling|upsell", "Cross-selling", "Enterprise Sales", "Sales Forecasting", "Deal Closing|closing deals",
      "Key Account Management",
    ],
  },
  {
    domain: "finance",
    category: "finance",
    terms: [
      "Financial Modeling|financial modelling", "Financial Analysis", "FP&A|fpa",
      "Budgeting", "Forecasting", "GAAP", "IFRS", "Accounts Payable", "Accounts Receivable",
      "Reconciliation", "Audit|auditing", "Taxation|tax planning|tax compliance", "Valuation", "QuickBooks", "SAP",
      "Tally", "Variance Analysis", "Cash Flow", "P&L|profit and loss", "Bookkeeping",
      "Risk Management", "Compliance", "Payroll",
    ],
  },
  {
    domain: "hr",
    category: "hr",
    terms: [
      "Recruiting|recruitment", "Talent Acquisition", "Sourcing", "Onboarding",
      "Employee Relations", "Performance Management", "HRIS", "Workday", "Compensation Planning|compensation and benefits",
      "Benefits Administration", "Succession Planning", "Employee Engagement", "Labor Law|labour law",
      "Learning and Development|l&d", "Diversity and Inclusion|dei|d&i", "Applicant Tracking System|ats",
      "Interviewing",
    ],
  },
  {
    domain: "operations",
    category: "operations",
    terms: [
      "Supply Chain", "Logistics", "Inventory Management|inventory", "Procurement", "Vendor Management",
      "Lean", "Six Sigma", "Process Improvement", "Project Management", "PMP", "ERP",
      "Operations Management", "Quality Assurance|qa", "Demand Planning", "Warehouse Management",
    ],
  },
  {
    domain: "general",
    category: "soft",
    terms: [
      "Leadership", "Communication|communication skills", "Mentoring|mentorship", "Cross-functional|cross functional",
      "Problem Solving", "Collaboration", "Ownership", "Presentation|presentations", "Documentation",
      "Analytical Skills|analytical", "Time Management", "Customer Service",
    ],
  },
];

export interface DictTerm {
  display: string;
  aliases: string[]; // lowercased, includes the display form
  domain: Domain;
  category: string;
}

export const DICTIONARY: DictTerm[] = GROUPS.flatMap((g) =>
  g.terms.map((line) => {
    const parts = line.split("|");
    return {
      display: parts[0],
      aliases: Array.from(new Set(parts.map((p) => p.toLowerCase()))),
      domain: g.domain,
      category: g.category,
    };
  }),
);

// Aliases that are also everyday English words. They only count when not written
// in all lowercase (e.g. "Go" or "REST" counts, "go" or "rest" does not).
export const CASE_SENSITIVE = new Set(["go", "rest", "spring", "node", "lambda", "lean", "ts", "js", "spark", "tally", "swift", "rust", "express", "sketch", "flutter", "dart", "looker"]);
