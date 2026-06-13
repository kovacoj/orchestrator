// 0 to 100 — artificial demo dataset
// All numbers chosen to match docs/reputation-dashboard-spec.md.
// No live API or DB. Edit here to change the demo story.

export type RiskLevel = "healthy" | "watch" | "warning" | "critical";
export type Severity =
  | "warning"
  | "watch"
  | "good"
  | "opportunity"
  | "suppressed";

// ─────────────────────────────────────────────────────────────────────────────
// Locations
// ─────────────────────────────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  manager: string;
  openingHours: string;
  seatingCapacity: number;
  baselineDailyTransactions: number;
  baselineAvgTicketCzk: number;
  baselineSentiment: number;
  currentSentiment: number;
  sentimentChangePct: number;
  currentRiskLevel: RiskLevel;
  weeklyRevenueCzk: number;
  complaintsLast7d: number;
  queuePressure8to9am: number; // 0..1
  mainTopic: string;
}

export const locations: Location[] = [
  {
    id: "LOC_001",
    name: "Vinohrady",
    district: "Prague 2",
    address: "Vinohradská 87",
    lat: 50.0786,
    lng: 14.4459,
    manager: "Petra K.",
    openingHours: "07:00 – 21:00",
    seatingCapacity: 38,
    baselineDailyTransactions: 320,
    baselineAvgTicketCzk: 142,
    baselineSentiment: 0.70,
    currentSentiment: 0.54,
    sentimentChangePct: -23,
    currentRiskLevel: "warning",
    weeklyRevenueCzk: 308000,
    complaintsLast7d: 21,
    queuePressure8to9am: 0.86,
    mainTopic: "Slow service",
  },
  {
    id: "LOC_002",
    name: "Karlín",
    district: "Prague 8",
    address: "Sokolovská 112",
    lat: 50.0925,
    lng: 14.4500,
    manager: "Tomáš H.",
    openingHours: "07:00 – 20:00",
    seatingCapacity: 42,
    baselineDailyTransactions: 350,
    baselineAvgTicketCzk: 148,
    baselineSentiment: 0.74,
    currentSentiment: 0.75,
    sentimentChangePct: 1,
    currentRiskLevel: "healthy",
    weeklyRevenueCzk: 362000,
    complaintsLast7d: 4,
    queuePressure8to9am: 0.55,
    mainTopic: "—",
  },
  {
    id: "LOC_003",
    name: "Old Town",
    district: "Prague 1",
    address: "Železná 14",
    lat: 50.0865,
    lng: 14.4234,
    manager: "Anna B.",
    openingHours: "08:00 – 22:00",
    seatingCapacity: 50,
    baselineDailyTransactions: 410,
    baselineAvgTicketCzk: 165,
    baselineSentiment: 0.68,
    currentSentiment: 0.69,
    sentimentChangePct: 1,
    currentRiskLevel: "healthy",
    weeklyRevenueCzk: 472000,
    complaintsLast7d: 9,
    queuePressure8to9am: 0.71,
    mainTopic: "—",
  },
  {
    id: "LOC_004",
    name: "Wenceslas",
    district: "Prague 1",
    address: "Václavské nám. 32",
    lat: 50.0813,
    lng: 14.4283,
    manager: "Jakub M.",
    openingHours: "07:00 – 22:00",
    seatingCapacity: 28,
    baselineDailyTransactions: 380,
    baselineAvgTicketCzk: 158,
    baselineSentiment: 0.65,
    currentSentiment: 0.62,
    sentimentChangePct: -5,
    currentRiskLevel: "watch",
    weeklyRevenueCzk: 420000,
    complaintsLast7d: 12,
    queuePressure8to9am: 0.79,
    mainTopic: "Queue",
  },
  {
    id: "LOC_005",
    name: "Smíchov Anděl",
    district: "Prague 5",
    address: "Plzeňská 8",
    lat: 50.0712,
    lng: 14.4036,
    manager: "Eliška R.",
    openingHours: "07:00 – 21:00",
    seatingCapacity: 36,
    baselineDailyTransactions: 290,
    baselineAvgTicketCzk: 138,
    baselineSentiment: 0.71,
    currentSentiment: 0.70,
    sentimentChangePct: -1,
    currentRiskLevel: "healthy",
    weeklyRevenueCzk: 268000,
    complaintsLast7d: 5,
    queuePressure8to9am: 0.51,
    mainTopic: "—",
  },
  {
    id: "LOC_006",
    name: "Dejvice",
    district: "Prague 6",
    address: "Dejvická 22",
    lat: 50.1006,
    lng: 14.3937,
    manager: "Martin S.",
    openingHours: "07:00 – 20:00",
    seatingCapacity: 40,
    baselineDailyTransactions: 270,
    baselineAvgTicketCzk: 132,
    baselineSentiment: 0.72,
    currentSentiment: 0.73,
    sentimentChangePct: 1,
    currentRiskLevel: "healthy",
    weeklyRevenueCzk: 240000,
    complaintsLast7d: 3,
    queuePressure8to9am: 0.48,
    mainTopic: "—",
  },
  {
    id: "LOC_007",
    name: "Holešovice",
    district: "Prague 7",
    address: "Komunardů 30",
    lat: 50.1063,
    lng: 14.4423,
    manager: "Lenka V.",
    openingHours: "07:30 – 21:00",
    seatingCapacity: 44,
    baselineDailyTransactions: 260,
    baselineAvgTicketCzk: 145,
    baselineSentiment: 0.73,
    currentSentiment: 0.74,
    sentimentChangePct: 1,
    currentRiskLevel: "healthy",
    weeklyRevenueCzk: 252000,
    complaintsLast7d: 4,
    queuePressure8to9am: 0.50,
    mainTopic: "—",
  },
  {
    id: "LOC_008",
    name: "Žižkov",
    district: "Prague 3",
    address: "Seifertova 60",
    lat: 50.0820,
    lng: 14.4528,
    manager: "David P.",
    openingHours: "07:00 – 21:00",
    seatingCapacity: 30,
    baselineDailyTransactions: 230,
    baselineAvgTicketCzk: 121,
    baselineSentiment: 0.66,
    currentSentiment: 0.63,
    sentimentChangePct: -4,
    currentRiskLevel: "watch",
    weeklyRevenueCzk: 192000,
    complaintsLast7d: 8,
    queuePressure8to9am: 0.57,
    mainTopic: "Price",
  },
  {
    id: "LOC_009",
    name: "Nusle",
    district: "Prague 4",
    address: "Otakarova 4",
    lat: 50.0617,
    lng: 14.4421,
    manager: "Klára N.",
    openingHours: "07:30 – 20:00",
    seatingCapacity: 24,
    baselineDailyTransactions: 180,
    baselineAvgTicketCzk: 124,
    baselineSentiment: 0.70,
    currentSentiment: 0.71,
    sentimentChangePct: 1,
    currentRiskLevel: "healthy",
    weeklyRevenueCzk: 152000,
    complaintsLast7d: 2,
    queuePressure8to9am: 0.43,
    mainTopic: "—",
  },
  {
    id: "LOC_010",
    name: "Chodov",
    district: "Prague 11",
    address: "Roztylská 19 (Chodov)",
    lat: 50.0309,
    lng: 14.4912,
    manager: "Pavel L.",
    openingHours: "09:00 – 21:00",
    seatingCapacity: 60,
    baselineDailyTransactions: 410,
    baselineAvgTicketCzk: 130,
    baselineSentiment: 0.68,
    currentSentiment: 0.68,
    sentimentChangePct: 0,
    currentRiskLevel: "healthy",
    weeklyRevenueCzk: 172000,
    complaintsLast7d: 5,
    queuePressure8to9am: 0.45,
    mainTopic: "—",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Competitors
// ─────────────────────────────────────────────────────────────────────────────

export interface Competitor {
  id: string;
  name: string;
  district: string;
  status: "Promotion detected" | "Stable" | "Price increase" | "New seasonal menu";
  detail: string;
  detectedAt: string;
}

export const competitors: Competitor[] = [
  {
    id: "COMP_001",
    name: "Competitor A — Vinohrady",
    district: "Vinohrady",
    status: "Promotion detected",
    detail: "10–15% discount on cappuccino and flat white during morning hours.",
    detectedAt: "Jun 6",
  },
  {
    id: "COMP_002",
    name: "Competitor B — Karlín",
    district: "Karlín",
    status: "Stable",
    detail: "No notable change in pricing or menu.",
    detectedAt: "—",
  },
  {
    id: "COMP_003",
    name: "Competitor C — Old Town",
    district: "Old Town",
    status: "Price increase",
    detail: "Specialty drinks raised by ~8% over the last 2 weeks.",
    detectedAt: "May 31",
  },
  {
    id: "COMP_004",
    name: "Competitor D — Wenceslas",
    district: "Wenceslas",
    status: "New seasonal menu",
    detail: "Summer menu launched; cold-brew and lemonades featured.",
    detectedAt: "Jun 4",
  },
  {
    id: "COMP_005",
    name: "Competitor E — Smíchov",
    district: "Smíchov",
    status: "Stable",
    detail: "No notable change detected.",
    detectedAt: "—",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KPIs
// ─────────────────────────────────────────────────────────────────────────────

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta?: string;
  status: Severity;
  hint: string;
}

export const kpis: Kpi[] = [
  {
    id: "kpi.revenue",
    label: "7-Day Revenue",
    value: "1.84M CZK",
    delta: "+4.2% vs prev. period",
    status: "good",
    hint: "Sum of transaction revenue across all 10 Prague locations over the last 7 days.",
  },
  {
    id: "kpi.sentiment",
    label: "Average Sentiment",
    value: "0.71",
    delta: "-6.8% vs prev. period",
    status: "watch",
    hint: "Mean review sentiment (-1..1) across all locations, last 7 days.",
  },
  {
    id: "kpi.vinohrady",
    label: "Vinohrady Sentiment Change",
    value: "-23%",
    status: "warning",
    hint: "Vinohrady 7-day sentiment vs previous 21-day baseline.",
  },
  {
    id: "kpi.alerts",
    label: "Active Alerts",
    value: "1",
    delta: "+1 vs prev. period",
    status: "warning",
    hint: "Open alerts requiring operator review.",
  },
  {
    id: "kpi.compmoves",
    label: "Competitor Moves",
    value: "2",
    status: "watch",
    hint: "Distinct competitor pricing/menu changes detected this week.",
  },
  {
    id: "kpi.waittime",
    label: "Expected Wait-Time Reduction",
    value: "-2.5 min",
    delta: "if one extra morning staff member is added",
    status: "opportunity",
    hint: "Forecasted average wait-time impact of the recommended staffing action.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main alert
// ─────────────────────────────────────────────────────────────────────────────

export interface MainAlert {
  id: string;
  severity: Severity;
  title: string;
  locationId: string;
  locationName: string;
  summary: string;
  primaryMetric: { name: string; value: number; display: string };
  likelyCause: string;
  externalContext: string;
  recommendedAction: string;
  confidence: number;
  evidence: string[];
  caveats: string;
}

export const mainAlert: MainAlert = {
  id: "ALERT_001",
  severity: "warning",
  title: "Vinohrady sentiment dropped 23%",
  locationId: "LOC_001",
  locationName: "Vinohrady",
  summary:
    "Slow-service complaints increased during the 8–9 AM morning peak while a nearby competitor promotion was detected.",
  primaryMetric: { name: "Sentiment drop", value: -23, display: "-23%" },
  likelyCause: "Slow-service complaints during morning peak",
  externalContext: "Nearby competitor promotion detected",
  recommendedAction:
    "Add one morning-shift staff member for three days and monitor recovery.",
  confidence: 0.89,
  evidence: [
    "7-day sentiment below previous 21-day baseline",
    "Slow-service topic share increased",
    "8–9 AM queue pressure elevated",
    "Morning staffing coverage below normal",
    "Nearby competitor price promotion detected",
  ],
  caveats:
    "Review data can be noisy. This is a location-level signal, not individual staff attribution.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Findings
// ─────────────────────────────────────────────────────────────────────────────

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  whatWasFound: string;
  whyItMatters?: string;
  recommendedAction?: string;
  interpretation?: string;
  evidence?: string[];
  important?: string;
}

export const findings: Finding[] = [
  {
    id: "FINDING_001",
    title: "Vinohrady sentiment dropped 23%",
    severity: "warning",
    confidence: 0.89,
    whatWasFound:
      "The 7-day sentiment average fell by approximately 23% compared with the previous 21-day baseline.",
    whyItMatters:
      "A sustained sentiment drop can reduce repeat visits and signals a location-level operational issue.",
    recommendedAction:
      "Add one morning-shift staff member for three days and monitor recovery.",
    evidence: [
      "7-day rolling sentiment ≈ 0.54 vs baseline 0.70",
      "Slow-service topic share up 41%",
      "8–9 AM queue pressure ≈ 0.86 (baseline 0.62)",
    ],
  },
  {
    id: "FINDING_002",
    title: "Slow-service complaints increased",
    severity: "warning",
    confidence: 0.86,
    whatWasFound:
      "Reviews and complaint topics increasingly mention waiting, queueing, and slow service.",
    evidence: [
      "Slow-service topic count 18 (prev. 7)",
      "Queue topic count 11 (prev. 4)",
    ],
  },
  {
    id: "FINDING_003",
    title: "Queue pressure rose during 8–9 AM",
    severity: "warning",
    confidence: 0.81,
    whatWasFound:
      "Morning queue pressure increased during the same window as the complaint spike.",
  },
  {
    id: "FINDING_004",
    title: "Staffing coverage was below normal",
    severity: "watch",
    confidence: 0.78,
    whatWasFound:
      "The affected mornings had lower staffing coverage than the location's normal morning baseline.",
    important:
      "This is a staffing coverage signal, not individual employee attribution.",
  },
  {
    id: "FINDING_005",
    title: "Nearby competitor promotion detected",
    severity: "watch",
    confidence: 0.72,
    whatWasFound:
      "A nearby competitor launched a morning promotion on cappuccino and flat white.",
    interpretation:
      "This may increase local price sensitivity, but it is secondary to the slow-service signal.",
  },
  {
    id: "FINDING_006",
    title: "Extra staff predicted to improve recovery",
    severity: "opportunity",
    confidence: 0.84,
    whatWasFound:
      "Adding one morning-shift staff member is predicted to reduce queue pressure, shorten wait times, and support sentiment recovery within 3–5 days.",
  },
  {
    id: "FINDING_007",
    title: "Menu trend signal suppressed",
    severity: "suppressed",
    confidence: 0.45,
    whatWasFound:
      "There is a weak oat-milk/menu-trend signal, but it is not strong enough to trigger an alert.",
  },
  {
    id: "FINDING_008",
    title: "Individual staff attribution suppressed",
    severity: "suppressed",
    confidence: 0.31,
    whatWasFound:
      "There is insufficient evidence to attribute the issue to individual staff members.",
    important:
      "0 to 100 does not make individual staff blame recommendations from sparse public-review data.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Predictions
// ─────────────────────────────────────────────────────────────────────────────

export interface Prediction {
  id: string;
  title: string;
  summary: string;
  drivers: string[];
  uncertainty: string;
  confidence: number;
}

export const predictions: Prediction[] = [
  {
    id: "PRED_001",
    title: "Sentiment Recovery Forecast",
    summary:
      "With one additional morning-shift staff member, Vinohrady sentiment is expected to begin recovering within 3–5 days.",
    drivers: [
      "Morning queue pressure is elevated.",
      "Slow-service complaints increased.",
      "Staffing coverage was below normal.",
    ],
    uncertainty:
      "Review volume is noisy, so sentiment intervals are wider than revenue intervals.",
    confidence: 0.82,
  },
  {
    id: "PRED_002",
    title: "Queue Pressure Forecast",
    summary:
      "Without action, morning queue pressure is likely to stay elevated. With extra staff, queue pressure is expected to fall by roughly 18%.",
    drivers: [
      "Throughput limited by current morning staffing.",
      "Historical 8–9 AM peak is consistent week-to-week.",
    ],
    uncertainty: "Weather and one-off demand shocks remain unmodeled.",
    confidence: 0.79,
  },
  {
    id: "PRED_003",
    title: "Wait-Time Forecast",
    summary:
      "Adding one morning staff member is expected to reduce average wait time by about 2.5 minutes.",
    drivers: ["Bottleneck currently at espresso station during 8–9 AM."],
    uncertainty:
      "Estimate based on historical staffing-vs-throughput patterns, not a controlled experiment.",
    confidence: 0.84,
  },
  {
    id: "PRED_004",
    title: "Revenue Risk Forecast",
    summary:
      "If the issue persists, Vinohrady faces a short-term revenue risk from lower repeat visits and competitor pressure.",
    drivers: [
      "Repeat-visit elasticity to sentiment is meaningful at location level.",
      "Competitor A promotion overlaps Vinohrady catchment.",
    ],
    uncertainty: "Revenue elasticity to sentiment varies by season.",
    confidence: 0.66,
  },
  {
    id: "PRED_005",
    title: "Competitor Impact Forecast",
    summary:
      "The nearby competitor promotion creates an estimated 4% seven-day revenue risk, but operational service quality is the stronger immediate lever.",
    drivers: ["Promotion is concentrated on morning espresso drinks."],
    uncertainty: "Cross-elasticity assumed from prior promotions.",
    confidence: 0.61,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lab decisions
// ─────────────────────────────────────────────────────────────────────────────

export interface LabDecision {
  id: string;
  name: string;
  decision: "Selected" | "Hidden";
  confidence: number;
  summary: string;
  visibility: "active" | "suppressed";
}

export const labDecisions: LabDecision[] = [
  {
    id: "LAB_001",
    name: "Location Sentiment Lab",
    decision: "Selected",
    confidence: 0.89,
    summary: "Vinohrady sentiment is down 23%; slow-service complaints increased.",
    visibility: "active",
  },
  {
    id: "LAB_002",
    name: "Competitor Price Lab",
    decision: "Selected",
    confidence: 0.82,
    summary: "Nearby competitor promotion detected in Vinohrady.",
    visibility: "active",
  },
  {
    id: "LAB_003",
    name: "Peak Hours Analysis Lab",
    decision: "Selected",
    confidence: 0.76,
    summary: "8–9 AM queue pressure correlates with complaint spike.",
    visibility: "active",
  },
  {
    id: "LAB_004",
    name: "Menu Trend Lab",
    decision: "Hidden",
    confidence: 0.45,
    summary: "Oat-milk trend exists but is too weak for alerting.",
    visibility: "suppressed",
  },
  {
    id: "LAB_005",
    name: "Staff/Shift Mention Lab",
    decision: "Hidden",
    confidence: 0.31,
    summary: "Insufficient evidence for individual staff attribution.",
    visibility: "suppressed",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Charts data
// ─────────────────────────────────────────────────────────────────────────────

// Revenue by location (last 7 days, k CZK)
export const revenueByLocation = locations.map((l) => ({
  name: l.name,
  revenueK: Math.round(l.weeklyRevenueCzk / 1000),
  risk: l.currentRiskLevel,
}));

// Vinohrady sentiment trend (per spec)
export const sentimentTrendVinohrady = [
  { date: "Jun 1", sentiment: 0.71, rolling7d: 0.70, baseline: 0.70 },
  { date: "Jun 2", sentiment: 0.70, rolling7d: 0.70, baseline: 0.70 },
  { date: "Jun 3", sentiment: 0.69, rolling7d: 0.69, baseline: 0.70 },
  { date: "Jun 4", sentiment: 0.64, rolling7d: 0.67, baseline: 0.70 },
  { date: "Jun 5", sentiment: 0.59, rolling7d: 0.64, baseline: 0.70 },
  { date: "Jun 6", sentiment: 0.55, rolling7d: 0.61, baseline: 0.70 },
  { date: "Jun 7", sentiment: 0.52, rolling7d: 0.58, baseline: 0.70 },
  { date: "Jun 8", sentiment: 0.54, rolling7d: 0.56, baseline: 0.70 },
  { date: "Jun 9", sentiment: 0.53, rolling7d: 0.54, baseline: 0.70 },
];

// Sentiment recovery forecast
export const sentimentRecoveryForecast = [
  { day: "Today", noAction: 0.54, extraStaff: 0.54 },
  { day: "+1", noAction: 0.53, extraStaff: 0.56 },
  { day: "+2", noAction: 0.54, extraStaff: 0.59 },
  { day: "+3", noAction: 0.55, extraStaff: 0.62 },
  { day: "+4", noAction: 0.56, extraStaff: 0.64 },
  { day: "+5", noAction: 0.57, extraStaff: 0.66 },
  { day: "+6", noAction: 0.58, extraStaff: 0.67 },
  { day: "+7", noAction: 0.59, extraStaff: 0.68 },
];

// Queue pressure forecast
export const queuePressureForecast = [
  { day: "Today", noAction: 0.86, extraStaff: 0.86 },
  { day: "+1", noAction: 0.87, extraStaff: 0.68 },
  { day: "+2", noAction: 0.84, extraStaff: 0.64 },
  { day: "+3", noAction: 0.83, extraStaff: 0.61 },
  { day: "+4", noAction: 0.81, extraStaff: 0.60 },
  { day: "+5", noAction: 0.79, extraStaff: 0.59 },
  { day: "+6", noAction: 0.78, extraStaff: 0.59 },
  { day: "+7", noAction: 0.77, extraStaff: 0.58 },
];

// Wait-time forecast (minutes)
export const waitTimeForecast = [
  { day: "Today", noAction: 7.8, extraStaff: 7.8 },
  { day: "+1", noAction: 7.9, extraStaff: 6.4 },
  { day: "+2", noAction: 7.7, extraStaff: 6.0 },
  { day: "+3", noAction: 7.6, extraStaff: 5.7 },
  { day: "+4", noAction: 7.5, extraStaff: 5.5 },
  { day: "+5", noAction: 7.4, extraStaff: 5.4 },
  { day: "+6", noAction: 7.3, extraStaff: 5.3 },
  { day: "+7", noAction: 7.3, extraStaff: 5.3 },
];

// Complaint topics for Vinohrady (counts last 14 days vs previous 14)
export const complaintTopicsVinohrady = [
  { topic: "Slow service", current: 18, baseline: 7 },
  { topic: "Queue", current: 11, baseline: 4 },
  { topic: "Price", current: 4, baseline: 5 },
  { topic: "Taste quality", current: 3, baseline: 4 },
  { topic: "Staff friendliness", current: 2, baseline: 3 },
  { topic: "Cleanliness", current: 1, baseline: 2 },
  { topic: "Ambience", current: 2, baseline: 2 },
];

// Queue pressure vs complaints (scatter — one point per day, last 14 days)
export const queueVsComplaints = [
  { queue: 0.52, complaints: 1, day: "D-13" },
  { queue: 0.55, complaints: 2, day: "D-12" },
  { queue: 0.57, complaints: 2, day: "D-11" },
  { queue: 0.61, complaints: 3, day: "D-10" },
  { queue: 0.59, complaints: 1, day: "D-9" },
  { queue: 0.63, complaints: 2, day: "D-8" },
  { queue: 0.66, complaints: 3, day: "D-7" },
  { queue: 0.72, complaints: 4, day: "D-6" },
  { queue: 0.79, complaints: 5, day: "D-5" },
  { queue: 0.81, complaints: 6, day: "D-4" },
  { queue: 0.84, complaints: 8, day: "D-3" },
  { queue: 0.85, complaints: 7, day: "D-2" },
  { queue: 0.86, complaints: 9, day: "D-1" },
  { queue: 0.86, complaints: 8, day: "Today" },
];

// Competitor price index (last 14 days)
export const competitorPriceIndex = [
  { date: "May 27", compA: 100, compC: 100, compD: 100 },
  { date: "May 29", compA: 100, compC: 102, compD: 100 },
  { date: "May 31", compA: 100, compC: 108, compD: 100 },
  { date: "Jun 2", compA: 100, compC: 108, compD: 100 },
  { date: "Jun 4", compA: 100, compC: 108, compD: 104 },
  { date: "Jun 6", compA: 88, compC: 108, compD: 104 },
  { date: "Jun 8", compA: 86, compC: 108, compD: 104 },
];

// Lab confidence chart
export const labConfidenceData = labDecisions.map((l) => ({
  name: l.name.replace(" Lab", ""),
  confidence: l.confidence,
  decision: l.decision,
}));

// Sentiment heatmap: 10 locations × last 14 days (sentiment 0..1)
// Vinohrady deteriorates in the last 7 days; others mostly stable.
function genHeatmap() {
  const days = 14;
  return locations.map((l) => {
    const cells: { day: string; value: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayLabel = i === 0 ? "Today" : `D-${i}`;
      let v = l.baselineSentiment;
      if (l.id === "LOC_001" && i <= 7) {
        // gradient down in the last 7 days
        v = l.baselineSentiment - ((7 - i) / 7) * 0.18 + (i % 2 === 0 ? 0.01 : -0.01);
      } else {
        v = l.baselineSentiment + ((i * 7) % 5 - 2) * 0.01;
      }
      cells.push({ day: dayLabel, value: Number(v.toFixed(2)) });
    }
    return { id: l.id, name: l.name, cells };
  });
}
export const sentimentHeatmap = genHeatmap();

// Alert timeline (chronological)
export const alertTimeline = [
  {
    when: "8 days ago",
    label: "Staffing coverage dips",
    detail: "Morning roster short by 1 on 3 of 5 weekdays.",
  },
  {
    when: "6 days ago",
    label: "Queue pressure rises",
    detail: "8–9 AM queue pressure crosses 0.75 for the first time this quarter.",
  },
  {
    when: "5 days ago",
    label: "Slow-service complaints increase",
    detail: "Slow-service topic count doubles vs prior 14d baseline.",
  },
  {
    when: "4 days ago",
    label: "Sentiment drops",
    detail: "7-day rolling sentiment dips below 0.65 for the first time.",
  },
  {
    when: "3 days ago",
    label: "Competitor promotion detected",
    detail: "Competitor A launches 10–15% morning promo on espresso drinks.",
  },
  {
    when: "Today",
    label: "Alert generated",
    detail: "Composite signal exceeds warning threshold; alert ALERT_001 fired.",
  },
  {
    when: "Today",
    label: "Recommended action proposed",
    detail: "Add 1 morning-shift staff member for 3 days; monitor recovery.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  title: string;
  type: string;
  summary: string;
  sections: { heading: string; body: string }[];
  linkedFindings: string[];
  linkedCharts: string[];
}

export const reports: Report[] = [
  {
    id: "REP_001",
    title: "Daily Executive Brief",
    type: "Daily Brief",
    summary:
      "One active warning was detected. Vinohrady sentiment dropped 23% compared with the previous baseline.",
    sections: [
      {
        heading: "What happened",
        body: "Vinohrady's 7-day sentiment fell from a baseline of ≈0.70 to ≈0.54. Slow-service and queue complaints increased and the spike is concentrated during the 8–9 AM peak.",
      },
      {
        heading: "Likely cause",
        body: "Lower-than-normal morning staffing coverage, leading to higher queue pressure and slower service. A nearby competitor promotion is treated as secondary context.",
      },
      {
        heading: "Recommended action",
        body: "Add one morning-shift staff member at Vinohrady for three days. Monitor 7-day sentiment, queue pressure, and slow-service topic share.",
      },
    ],
    linkedFindings: ["FINDING_001", "FINDING_002", "FINDING_003", "FINDING_004"],
    linkedCharts: ["sentimentTrendVinohrady", "queuePressureForecast"],
  },
  {
    id: "REP_002",
    title: "Vinohrady Incident Report",
    type: "Incident",
    summary:
      "Operational analysis of the Vinohrady reputation incident and the supporting evidence.",
    sections: [
      {
        heading: "Incident window",
        body: "Most recent 7–10 days. Sentiment fell from ~0.70 to ~0.54.",
      },
      {
        heading: "Evidence",
        body: "Sentiment drop, complaint topic shift (slow service +157%, queue +175%), queue pressure 0.86 vs baseline 0.62, morning staffing -1 on multiple days.",
      },
      {
        heading: "Caveats",
        body: "Review data is noisy. This is a location-level signal, not individual staff attribution.",
      },
    ],
    linkedFindings: ["FINDING_001", "FINDING_002", "FINDING_003", "FINDING_004", "FINDING_005"],
    linkedCharts: ["sentimentTrendVinohrady", "complaintTopicsVinohrady", "queueVsComplaints"],
  },
  {
    id: "REP_003",
    title: "Prediction Report",
    type: "Forecast",
    summary:
      "Forecasted outcomes under two scenarios: no action vs add one morning staff member for three days.",
    sections: [
      {
        heading: "Sentiment recovery",
        body: "Expected to begin recovering within 3–5 days under the staffing action; minimal change without action.",
      },
      {
        heading: "Queue pressure",
        body: "Expected -18% in the 8–9 AM window under the staffing action.",
      },
      {
        heading: "Wait-time",
        body: "Expected -2.5 min average wait-time under the staffing action.",
      },
    ],
    linkedFindings: ["FINDING_006"],
    linkedCharts: ["sentimentRecoveryForecast", "queuePressureForecast", "waitTimeForecast"],
  },
  {
    id: "REP_004",
    title: "Research Lab Decision Report",
    type: "Methodology",
    summary:
      "Which research labs were selected as active evidence and which were suppressed as weak signals.",
    sections: [
      {
        heading: "Selected labs",
        body: "Location Sentiment (0.89), Competitor Price (0.82), Peak Hours Analysis (0.76).",
      },
      {
        heading: "Suppressed labs",
        body: "Menu Trend (0.45), Staff/Shift Mention (0.31). Suppressed labs do not become recommendations and never produce individual staff attribution.",
      },
    ],
    linkedFindings: ["FINDING_007", "FINDING_008"],
    linkedCharts: ["labConfidenceData"],
  },
  {
    id: "REP_005",
    title: "Data Quality Report",
    type: "Data Quality",
    summary:
      "Data provenance and known limitations for this demo.",
    sections: [
      {
        heading: "Source",
        body: "Artificial demo data. No live Apify, no live review APIs, no real customer or employee data.",
      },
      {
        heading: "Coverage",
        body: "10 Prague locations, 5 competitors, 120-day synthetic window with detailed 14-day incident.",
      },
      {
        heading: "Limitations",
        body: "Numbers are illustrative. Do not use these forecasts to make real business decisions.",
      },
    ],
    linkedFindings: [],
    linkedCharts: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Convenience exports
// ─────────────────────────────────────────────────────────────────────────────

export const vinohrady = locations[0];
export const locationRiskRanking = [...locations].sort((a, b) => {
  const order: Record<RiskLevel, number> = {
    critical: 0,
    warning: 1,
    watch: 2,
    healthy: 3,
  };
  return order[a.currentRiskLevel] - order[b.currentRiskLevel];
});
