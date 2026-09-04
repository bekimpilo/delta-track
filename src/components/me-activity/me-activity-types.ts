export interface MEActivity {
  id: string;
  activity?: string;
  implementingEntity?: string;
  deliveryPartner?: string;
  responsible?: string;
  keyProjectActivity?: string;
  subActivityNo?: string;
  subActivities?: string;
  inputsResources?: string;
  taskNo?: string;
  task?: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  outputs?: string;
  indicator?: string;
  baseline?: string;
  target?: string;
  achieved?: string;
  variance?: string;
  meansOfVerification?: string;
  deliveryPartnerResponsible?: string;
  comments?: string;
}

export const ME_STATUSES = ["Not Yet Started", "In Progress", "Completed", "On Hold"] as const;

export const emptyMEActivity: MEActivity = {
  id: "",
  activity: "",
  implementingEntity: "",
  deliveryPartner: "",
  responsible: "",
  keyProjectActivity: "",
  subActivityNo: "",
  subActivities: "",
  inputsResources: "",
  taskNo: "",
  task: "",
  status: "Not Yet Started",
  startDate: "",
  endDate: "",
  outputs: "",
  indicator: "",
  baseline: "",
  target: "",
  achieved: "",
  variance: "",
  meansOfVerification: "",
  deliveryPartnerResponsible: "",
  comments: "",
};

// Variance is auto-calculated when both target and achieved are numeric.
export const computeVariance = (target?: string, achieved?: string): string => {
  const t = Number(String(target ?? "").replace(/[^0-9.-]/g, ""));
  const a = Number(String(achieved ?? "").replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(t) || !Number.isFinite(a) || target === "" || achieved === "") return "";
  const v = a - t;
  return `${v > 0 ? "+" : ""}${v}`;
};
