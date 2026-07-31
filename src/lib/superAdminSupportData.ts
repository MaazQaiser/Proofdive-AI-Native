export type SupportRequestType =
  | "admin"
  | "partner"
  | "employer"
  | "subscription"
  | "deletion"
  | "candidate";

export type SupportRequestStatus = "open" | "resolved";

export const SUPPORT_REQUEST_TYPE_LABEL: Record<SupportRequestType, string> = {
  admin: "Admin Support Request",
  partner: "Partner Support Request",
  employer: "Employer Support Request",
  subscription: "Subscription / Plan / Add-on Request",
  deletion: "Revoke Consent / User Deletion Request",
  candidate: "B2C Candidate Support Request",
};

export const SUPPORT_REQUEST_STATUS_LABEL: Record<SupportRequestStatus, string> = {
  open: "Open",
  resolved: "Resolved",
};

export type SupportRequest = {
  id: string;
  type: SupportRequestType;
  title: string;
  description: string;
  requestedByEmail: string;
  requestedAt: string;
  status: SupportRequestStatus;
};

export const SEED_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: "sr_001",
    type: "partner",
    title: "Referral code not applying at signup",
    description:
      "Candidates using my referral code MAYACH42 are completing signup without the partner attribution showing on my dashboard.",
    requestedByEmail: "maya@careerboost.coach",
    requestedAt: "2026-07-30T14:22:00.000Z",
    status: "open",
  },
  {
    id: "sr_002",
    type: "subscription",
    title: "Request to increase Mock Interview allocation",
    description:
      "Our Growth plan is running low on Mock Interview credits for Q3 cohort onboarding. Please advise on add-on purchase options.",
    requestedByEmail: "admin@acmerobotics.com",
    requestedAt: "2026-07-29T09:10:00.000Z",
    status: "open",
  },
  {
    id: "sr_003",
    type: "candidate",
    title: "Unable to download storyboard PDF",
    description:
      "When I click Download on my crafted storyboard, the browser shows a blank page and nothing downloads.",
    requestedByEmail: "alex.candidate@gmail.com",
    requestedAt: "2026-07-28T18:45:00.000Z",
    status: "open",
  },
  {
    id: "sr_004",
    type: "deletion",
    title: "GDPR deletion request for Org Admin account",
    description:
      "Please process account deletion and revoke consent for data processing for the Acme Robotics admin account.",
    requestedByEmail: "admin@acmerobotics.com",
    requestedAt: "2026-07-27T11:05:00.000Z",
    status: "open",
  },
  {
    id: "sr_005",
    type: "employer",
    title: "Interview link generation failing for new JD",
    description:
      "Creating a JD and generating an interview link returns an error after the review step. JD title: Senior Product Designer.",
    requestedByEmail: "hiring@northwind.io",
    requestedAt: "2026-07-26T16:30:00.000Z",
    status: "resolved",
  },
  {
    id: "sr_006",
    type: "admin",
    title: "CSV user invite partially failed",
    description:
      "Uploaded a CSV of 250 candidates; 12 rows failed with a validation error that was not shown in the summary.",
    requestedByEmail: "admin@stanford.edu",
    requestedAt: "2026-07-25T08:20:00.000Z",
    status: "resolved",
  },
  {
    id: "sr_007",
    type: "partner",
    title: "Withdrawal amount stuck after failed Stripe attempt",
    description:
      "Available balance did not restore after a failed withdrawal simulation. Need balance corrected.",
    requestedByEmail: "jordan@creatorsphere.io",
    requestedAt: "2026-07-24T13:55:00.000Z",
    status: "open",
  },
  {
    id: "sr_008",
    type: "subscription",
    title: "Invoice download for June missing line items",
    description: "June subscription invoice PDF is missing the storyboard add-on line item we purchased mid-cycle.",
    requestedByEmail: "ops@campuslaunch.edu",
    requestedAt: "2026-07-20T10:00:00.000Z",
    status: "resolved",
  },
];
