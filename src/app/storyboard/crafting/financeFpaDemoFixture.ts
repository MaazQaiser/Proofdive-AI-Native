/**
 * Finance demo persona — Naila Farooq, Senior Financial Analyst (FP&A) at a
 * mid-market commercial lender, targeting FP&A Manager.
 *
 * Built for walking a client through the whole Storyboard end to end, so every
 * string here is written to survive being read aloud: real FP&A situations
 * (forecast variance, month-end close, the board pack, an IFRS 16 transition),
 * numbers that are specific but plausible, and assessments that say what is
 * missing as concretely as what is there. Nothing generic — a demo that reads
 * as filler teaches the client the wrong thing about the product.
 *
 * Mirrors softwareEngineerDive4Fixture.ts exactly in shape, so the same
 * seeding path in StoryboardAgent works for both.
 */

import type { Experience, RoleProfile } from "@/lib/proofdiveTypes";
import {
  COMPETENCY_SPECS,
  emptyCompetencySection,
  recomputeDiveScores,
  type CompetencyAssessment,
  type CompetencyId,
  type CompetencySection,
  type StoryboardDive,
} from "@/lib/storyboardDraft";

export const FINANCE_DEMO_DIVE_ID = "6f1c0b52-9a4e-4d17-9b0c-8e3a5d21f7c4";
export const FINANCE_DEMO_ROLE = "FP&A Manager";
export const FINANCE_DEMO_CANDIDATE = "Naila Farooq";
export const FINANCE_DEMO_INDUSTRY = "Finance";

/**
 * Written to read like a real posting AND to drive the Core Four suggestion to
 * this persona's four competencies. The suggester is keyword-based (see
 * coreFourSuggestion.ts), so the wording carries "analy/data/insight/pattern"
 * for Thinking, "own/accountab/responsib/deliver" for Action,
 * "communicat/stakeholder/present/influence/align" for People, and
 * "knowledge/framework/standard/tool/domain/concept" for Mastery.
 */
export const FINANCE_DEMO_JOB_DESCRIPTION = `# FP&A Manager

We are hiring an FP&A Manager to own the forecast, the operating plan and the numbers the board makes decisions on. You will sit between Finance and the business, and you will be accountable for the quality of what leaves this team.

## Responsibilities
- Own the rolling 13-week cash forecast and the annual operating plan, and be accountable for the accuracy of both.
- Analyse variance to plan every month, find the cause, not the symptom, and turn the data into insight the business can act on.
- Deliver the monthly board pack and present the numbers to stakeholders who are not accountants, so the commentary has to communicate the decision, not just the movement.
- Partner with budget holders to align spend to plan, and influence where the plan needs to change.
- Maintain the reporting framework and the judgements behind it to the relevant accounting standards, with documentation an auditor can follow.
- Apply domain knowledge of lending economics, unit cost and margin to challenge assumptions before they reach the plan.

## What we're looking for
- Strong analytical skills, comfortable finding the pattern in messy data and explaining what caused it.
- Genuine ownership: you carry work to a result instead of handing it on.
- Clear written and verbal communication with senior stakeholders, including the board.
- Depth in the relevant accounting standards and the concepts behind them, not just the mechanics of the tool.`;

export const FINANCE_DEMO_INTRO = `I'm a finance professional with seven years in FP&A, the last four in a mid-market commercial lender where I own the rolling forecast, the operating plan and the monthly board pack. I started in audit, which is where I learned to work backwards from a number until I can explain exactly what produced it, and that habit is still the most useful thing I do. Most of my work sits at the point where the ledger meets a decision: a variance that looks like a sales problem but turns out to be revenue timing, a close that runs a week late because nobody owns the calendar end to end, a board pack that nobody reads because it answers questions the directors were not asking. I'm at my best when I can take something like that, take it apart, and hand back a version people can act on. What I'm moving toward is an FP&A Manager role where I own the whole planning cycle and the team that runs it, not just my slice of it. Two things I'm proud of: I found a £2.4m variance that three months of commentary had mislabelled as lost revenue, and I took a month-end close from day eleven to day five and held it there for six months.`;

export const FINANCE_DEMO_FOCUS_IDS: CompetencyId[] = [
  "thinking-analytical",
  "action-ownership",
  "people-influence",
  "mastery-functional",
];

const STORY_META: Record<string, { title: string; interviewQuestion: string }> = {
  "thinking-analytical": {
    title: "The £2.4m variance that wasn't lost revenue",
    interviewQuestion:
      "Tell me about a time you found the real cause of a number nobody could explain.",
  },
  "action-ownership": {
    title: "Taking month-end close from day eleven to day five",
    interviewQuestion:
      "Tell me about something you took ownership of that nobody had asked you to own.",
  },
  "people-influence": {
    title: "The board pack nobody was reading",
    interviewQuestion:
      "Tell me about a time you had to change how senior stakeholders received information.",
  },
  "mastery-functional": {
    title: "IFRS 16 lease transition, 63 leases",
    interviewQuestion:
      "Tell me about a time your technical depth changed the outcome.",
  },
};

function assessed(
  car: { context: string; action: string; result: string },
  assessment: CompetencyAssessment,
  secondary: CompetencyId[],
): CompetencySection {
  return {
    locked: true,
    car,
    regenCount: 0,
    score: assessment.score,
    matchedSignals: [assessment.evidence],
    missingNextLevelSignals: [assessment.missingStrengths],
    secondaryCompetencies: secondary,
    consultantNotes: [],
    developmentRecommendation: assessment.development,
    assessment,
  };
}

const BY_ID: Partial<Record<CompetencyId, CompetencySection>> = {
  "thinking-analytical": assessed(
    {
      context:
        "Revenue had come in under forecast for three consecutive months — around 9% light each time — and the commentary going to the board had settled on the same explanation every month: the sales team was missing target. Two account directors were already on performance plans off the back of it. I was uneasy because new business bookings had actually held up, which did not fit the story we were telling.",
      action:
        "Rather than argue about the conclusion, I rebuilt the bridge underneath it. I took the quarter apart into booked, invoiced and recognised, and reconciled each step instead of trusting the summary. Then I segmented by product and by contract type, because that was the only cut we had never looked at. The pattern showed up immediately: the gap sat almost entirely in annual contracts sold after a policy change in April, which we had started recognising monthly, not on invoice. Bookings were fine; the revenue was simply landing later. To make sure I was not pattern-matching on one quarter, I re-ran the same bridge across the two prior quarters and got the same shape. I also pulled ten contracts and traced each one end to end so I could show the mechanism, not just the correlation.",
      result:
        "£2.4m of the shortfall was reclassified as timing rather than lost revenue, and the forecast was rebuilt on the recognition profile instead of the invoice profile. Accuracy moved from roughly ±9% to within ±2% for the following two quarters. Both performance plans were withdrawn. The bridge I built for that investigation is now the standard monthly variance pack.",
    },
    {
      levelLabel: "Insightful with emerging Elevates evidence",
      score: 4.5,
      evidence:
        "You did not accept the framing you were given. You rebuilt the bridge from booked to invoiced to recognised, which is the only cut that could separate a sales problem from a timing problem, and you found the segment where the gap actually sat. You then tested the finding instead of declaring it: you re-ran two prior quarters to check the pattern held, and traced ten contracts individually so you could show the mechanism, not a correlation. Turning that one investigation into the standard monthly variance pack is what takes this past a single good piece of analysis.",
      classificationRationale:
        "This sits at 4.5 because you showed both halves of strong analytical work — you found the cause, and you proved it was the cause. The disconfirming step (re-running prior quarters, tracing individual contracts) is what separates this from a clever hypothesis that happened to be right. It is not a 5 only because the reusable method landed as a template, not as a way of thinking you taught others to apply on their own.",
      missingStrengths:
        "To reach 5.0 — Elevates, show the analysis changing how other people reason, not just what they report. What is missing is evidence that you handed over the underlying question (\"which cut would separate cause from symptom?\") and not just the finished bridge, and that someone else then used it on a problem you were not in the room for.",
      development:
        "Next time, say out loud what would have proved you wrong. You already did the work — re-running prior quarters was a falsification test — but you described it as checking, when it was testing the hypothesis. Framing it that way is what makes an interviewer hear rigour instead of luck.",
      masterclass:
        "Work through Root Cause to Reusable Method, particularly the section on disconfirming evidence. It covers how to describe the test you ran against your own conclusion, which is the part of this story you are currently underselling.",
      aiCoach:
        "Rewrite the middle of this story as: the explanation on the table → why it did not fit → the cut that would settle it → what would have proved me wrong → what I found. Keep the £2.4m and the ±9% to ±2%; they are doing real work. Aim for four sentences.",
      relatedCompetenciesNarrative:
        "This same story carries Functional Knowledge — the whole finding rests on understanding revenue recognition well enough to know that the invoice profile and the recognition profile could diverge. It also gives you Communicates with Impact, because you had to unwind a conclusion two levels of management had already accepted, and Ownership & Drive, since nobody asked you to reopen it.",
      relatedQuestionTypes:
        "Use this for root-cause, \"tell me about a time you disagreed with a conclusion\", data-into-decision, and forecast-accuracy questions. It also answers \"tell me about a time you were right when others were not\" without sounding like you are claiming credit, because the evidence does the work.",
    },
    ["mastery-functional", "people-influence", "action-ownership"],
  ),

  "action-ownership": assessed(
    {
      context:
        "Month-end close was landing on day eleven against a group deadline of day five, and had been for as long as anyone could remember. Everyone owned their own piece and hit it; nobody owned the calendar end to end, so the slippage was invisible until it had already happened. Group had started escalating monthly, which was consuming more of the CFO's time than the close itself.",
      action:
        "I took the calendar, which was not my job and which nobody objected to me taking. I mapped every task with its real dependency, not its nominal owner, and timed three consecutive closes to find where the days actually went. Three things were causing almost all of it: intercompany reconciliations waiting on a file that treasury produced manually and only when chased, an accruals template that broke every month because it was keyed on a period reference someone re-typed by hand, and a bank feed that landed at 2pm on day two so day two was effectively lost. I fixed them in that order — agreed a standing 9am delivery with treasury, rebuilt the template so the period drove itself, and moved the feed to an overnight schedule. Then I ran two closes as dry runs alongside the real one, so the first live attempt at day five was not the first attempt.",
      result:
        "Close moved from day eleven to day five and held there for six months, including the two months I was on leave — which mattered more to me than the first month working. Group stopped escalating. The dependency map is now maintained as part of the close pack instead of living in my head.",
    },
    {
      levelLabel: "Proactive",
      score: 4,
      evidence:
        "You took something that was failing precisely because it had no owner, and you owned it without waiting for the mandate. The diagnosis was real work, not an assumption — you timed three closes to find where the days went instead of asking people where they thought the days went. You also pushed past the point most people stop: the dry runs, and the handover of the dependency map so the fix did not depend on you being there. The six months holding while you were on leave is the strongest evidence in the story.",
      classificationRationale:
        "This is a clear 4.0. You show initiative, follow-through and a durable result, and you removed yourself as the single point of failure. It stops short of 4.5 because the ownership stayed within a process you could reach yourself — there is no evidence yet of you holding others accountable to a standard when they were not inclined to meet it.",
      missingStrengths:
        "The gap to the next level is other people. Treasury changed their delivery time — how? A story that showed you securing a commitment from someone with no reason to give it to you, and then holding them to it when it slipped, would move this up. Right now the obstacles in the story are all mechanical.",
      development:
        "Add the conversation with treasury. \"I agreed a standing 9am delivery\" is doing a lot of quiet work — what did you offer, what did they push back on, and what did you do the first month it was late? That is the part an interviewer is listening for when they ask about ownership.",
      masterclass:
        "Ownership Beyond Your Own Remit covers exactly this: how to describe securing and holding a commitment from someone who does not report to you, without it sounding like either a favour or a fight.",
      aiCoach:
        "Add three sentences on the treasury conversation: what you asked for, what it cost them, and what you did the first time the file was late. Keep everything else — the day eleven to day five and the six months are the spine of this story.",
      relatedCompetenciesNarrative:
        "This is also a Prioritization story: you fixed three blockers in a deliberate order instead of all at once, and the order was driven by how many days each one was costing. There is Technical Application in the accruals template rebuild, and the beginnings of Grows Capability in handing the dependency map over instead of keeping it.",
      relatedQuestionTypes:
        "Use this for ownership, process improvement, \"tell me about a time you fixed something nobody asked you to fix\", and any question about working to a hard deadline. It is also a strong answer to \"what would your team say changed after you arrived?\"",
    },
    ["thinking-prioritization", "mastery-execution", "people-capability"],
  ),

  "people-influence": assessed(
    {
      context:
        "The monthly board pack had grown to 42 pages. Decisions were being deferred — twice in a row on the same capital request — because directors could not find the number the decision turned on. The pack was accurate; that was never the problem. It just made the board work to find what mattered, and they had thirty minutes.",
      action:
        "Instead of proposing a shorter pack, I asked what each page was for. I spoke to four non-executive directors separately and asked one question about the last three meetings: what decision were you trying to make, and where did you look. Two of them told me they went straight to the appendix and read the cash table, which was on page 38. That told me the pack was ordered by how finance produces information, not by how the board consumes it. I rebuilt it around decisions: a one-page summary naming each decision, the number it depends on and the recommendation, then five pages of support behind it. Before proposing it I pre-briefed the CFO and the audit committee chair separately — the CFO because the change was mine to justify to him first, and the chair because she was the person most likely to defend the old format and I would rather hear that in private.",
      result:
        "The six-page pack was adopted at the next meeting. The capital decision that had been deferred twice was taken in that meeting, in under ten minutes. The one-page summary is now the format for the quarterly investment committee as well, which I did not propose — the chair took it there herself.",
    },
    {
      levelLabel: "Adaptive",
      score: 4,
      evidence:
        "You diagnosed the audience before you touched the artefact, and you did it by asking about behaviour, not preference — what decision, and where did you look. That is what surfaced the page 38 problem, which no amount of asking \"is the pack useful?\" would have found. The pre-briefing shows real read of the room: you went to the CFO for authority and to the chair because she was the most likely objector, and you chose to hear that objection privately. The chair carrying the format to another committee is influence that outlasted the conversation.",
      classificationRationale:
        "4.0 fits because you changed a senior audience's behaviour and the change stuck without you maintaining it. It is not higher because the influence ran to one artefact for one audience. Influential — the level above — would show the same read applied where the stakes were contested — where someone had a reason to want the old version kept.",
      missingStrengths:
        "There is no resistance in this story. The chair might have defended the old format, but she did not, so we never see you handle a real objection. What is missing is a moment where you adapted the argument in the room after it landed badly, and what you changed about it.",
      development:
        "Say what you expected the chair to object to, and what you had prepared. Even though the objection never came, naming it shows you had modelled the other side — which is the substance of influence. Right now the story reads as smooth, and smooth is less convincing than prepared.",
      masterclass:
        "Influencing Without Authority, the module on pre-briefing and mapping objections, covers how to describe the objection you prepared for even when it did not arrive.",
      aiCoach:
        "Add two sentences: what you expected the audit chair to push back on, and how you had planned to answer. Then keep the ending exactly as it is — her taking the format to the investment committee is the strongest line in the story and it should land last.",
      relatedCompetenciesNarrative:
        "This doubles as an Analytical Thinking story — the insight came from a structured question asked four times, not from a redesign instinct. It also carries Innovation, since reordering the pack around decisions instead of around the ledger is a genuine reframe, and Collaboration & Inclusion in how you brought the CFO and the chair in before the room.",
      relatedQuestionTypes:
        "Use this for influencing senior stakeholders, communicating to a non-finance audience, \"tell me about a time you changed how something was done\", and any question about presenting to a board. It also answers \"how do you know your work landed?\" with something better than a thank-you.",
    },
    ["thinking-analytical", "mastery-innovation", "people-collaboration"],
  ),

  "mastery-functional": assessed(
    {
      context:
        "We had 63 property and equipment leases that had to come onto the balance sheet under IFRS 16, and nobody in the team had taken the standard end to end before. The auditors had already flagged it as the year's significant judgement area, which meant whatever we produced would be tested line by line.",
      action:
        "I read the standard properly before touching a model, including the basis for conclusions, because the judgements were going to matter more than the arithmetic. I chose the modified retrospective approach and wrote down why: full retrospective would have needed comparative data we did not hold for the older property leases, and the practical expedient on short leases removed about a third of the population for a materiality we could defend. The incremental borrowing rate was the piece I expected to be challenged hardest, so I built it with treasury off our actual facility pricing by tenor instead of a single blended rate, and documented the derivation. Then I wrote the judgements memo before the audit, not in response to it — every election, the alternative I rejected, and the reason — so the conversation with the auditors started from our reasoning instead of their questions.",
      result:
        "The transition passed with no audit adjustments and no management letter point. The judgements memo became the template the group now uses for new standards, and I was asked to walk two other entities through their own transition.",
    },
    {
      levelLabel: "Advanced with emerging Mastery evidence",
      score: 4.5,
      evidence:
        "You went to the standard and the basis for conclusions instead of a summary, and it shows in what you did next: you knew the judgements would be tested harder than the numbers, so that is where you put the effort. The borrowing rate is the clearest evidence — building it by tenor off actual facility pricing, instead of taking a blended rate, is a choice only someone who understood what the auditor would probe would make. Writing the judgements memo ahead of the audit, not in response to it, is the same instinct applied to the process.",
      classificationRationale:
        "4.5 because you did not just apply the standard correctly, you anticipated where it would be challenged and pre-built the defence. Documenting the rejected alternatives alongside the elections is what an experienced technical accountant does and a competent one does not. It is short of 5.0 because teaching two other entities is described as something you were asked to do, not something you shaped — we do not see what you changed about their approach.",
      missingStrengths:
        "The two entities you walked through their transition are the missing half of this story. What did they have wrong, what did you change, and did their judgements memo end up different from yours because their lease population was different? That is the difference between deep knowledge and knowledge others can use.",
      development:
        "Bring one specific judgement call into the story. \"I documented every election and the alternative I rejected\" is a claim; one worked example — the expedient you took on short leases and the materiality argument behind it — turns it into evidence an interviewer can weigh.",
      masterclass:
        "Technical Depth as a Differentiator, particularly the section on articulating judgement over method. It covers how to talk about a standard in a way that shows understanding, not familiarity.",
      aiCoach:
        "Pick your single hardest judgement on this transition — most likely the discount rate or the short-lease expedient — and write four sentences on it: what the standard permitted, what you chose, what you rejected, and what would have changed your mind. Drop one of the other details to make room.",
      relatedCompetenciesNarrative:
        "This is also a Decision-Making Agility story: modified retrospective over full retrospective was a real choice made under a data constraint, with a reason. There is Ownership & Drive in writing the memo ahead of the audit rather than waiting to be asked, and the seeds of Grows Capability in the two entities you took through it.",
      relatedQuestionTypes:
        "Use this for technical depth, \"tell me about a complex piece of accounting you led\", audit and judgement questions, and any question about learning something new quickly. It is also the right answer to \"where would you back yourself against a more senior candidate?\"",
    },
    ["thinking-decision", "action-ownership", "people-capability"],
  ),
};

export function buildFinanceDemoDive(): StoryboardDive {
  const competencies = COMPETENCY_SPECS.map(
    (spec) => BY_ID[spec.id] ?? emptyCompetencySection(),
  );
  return recomputeDiveScores({
    schemaVersion: 2,
    id: FINANCE_DEMO_DIVE_ID,
    diveNumber: 1,
    targetRole: FINANCE_DEMO_ROLE,
    status: "saved",
    savedAt: "2026-09-02T09:12:00.000Z",
    intro: {
      locked: true,
      regenCount: 0,
      text: FINANCE_DEMO_INTRO,
    },
    competencies,
    overallScore: 0,
    pillarScores: { thinking: 0, action: 0, people: 0, mastery: 0 },
  });
}

export type FinanceDemoStory = {
  competencyId: CompetencyId;
  title: string;
  interviewQuestion: string;
  car: { context: string; action: string; result: string };
  assessment: CompetencyAssessment;
  secondaryCompetencies: CompetencyId[];
};

export function financeDemoStories(): FinanceDemoStory[] {
  return FINANCE_DEMO_FOCUS_IDS.flatMap((id) => {
    const section = BY_ID[id];
    const meta = STORY_META[id];
    if (!section?.assessment || !meta) return [];
    return [
      {
        competencyId: id,
        title: meta.title,
        interviewQuestion: meta.interviewQuestion,
        car: section.car,
        assessment: section.assessment,
        secondaryCompetencies: section.secondaryCompetencies,
      },
    ];
  });
}

/**
 * The consultant follow-ups are real answers, not the assessment text echoed
 * back: these are what the candidate said in the moment, which is what the
 * Storyboard quotes as evidence.
 */
const FOLLOW_UPS: Record<string, [string, string]> = {
  "thinking-analytical": [
    "I kept asking what would have to be true for the sales explanation to be right — bookings would have had to fall, and they had not. That mismatch was the whole reason I reopened it.",
    "The risk was that I was three months late to a conclusion two directors had already been performance-managed on. I checked two prior quarters before I said anything, because being confidently wrong there would have cost more than saying nothing.",
  ],
  "action-ownership": [
    "Nobody owned the calendar, so I took it. The obstacle was treasury's manual file — I asked for a standing 9am delivery and offered to take their reconciliation prep off them in exchange, which made it a trade, not a favour.",
    "I knew it was done when the close landed on day five in a month I was on leave. Until then it was my close, not the team's.",
  ],
  "people-influence": [
    "I needed the audit committee chair, because she had defended the current format before. I asked her what she read first, not what she thought of the pack, and she told me she went straight to page 38.",
    "What shifted her was seeing her own behaviour described back to her. I did not argue that the pack was too long; I showed that the number she cared about was thirty-seven pages from where she started.",
  ],
  "mastery-functional": [
    "The standard permits either transition approach, and I chose modified retrospective because we did not hold comparative data for the older property leases. I wrote down the alternative and why I rejected it, which is what the auditors tested first.",
    "I knew I had applied it soundly when the audit closed with no adjustments and no management letter point — and when the memo was reused for the next standard instead of rewritten.",
  ],
};

export function buildFinanceDemoExperiences(): Experience[] {
  return financeDemoStories().map((story) => {
    const [q1, q2] = FOLLOW_UPS[story.competencyId] ?? ["", ""];
    return {
      id: `exp-finance-demo-${story.competencyId}`,
      role: FINANCE_DEMO_ROLE,
      title: story.title,
      raw: [story.car.context, story.car.action, story.car.result].join("\n\n"),
      createdAt: "2026-09-02T09:12:00.000Z",
      competencyId: story.competencyId,
      car: { ...story.car },
      consultantAnswers: [
        {
          id: `exp-finance-demo-${story.competencyId}-q1`,
          question: story.interviewQuestion,
          answer: q1,
        },
        {
          id: `exp-finance-demo-${story.competencyId}-q2`,
          question: "How did you know it had worked?",
          answer: q2,
        },
      ],
    };
  });
}

export function financeDemoRoleProfile(existing?: RoleProfile | null): RoleProfile {
  return {
    ...(existing ?? {}),
    name: FINANCE_DEMO_CANDIDATE,
    targetRole: FINANCE_DEMO_ROLE,
    industryVertical: FINANCE_DEMO_INDUSTRY,
    jobDescription: FINANCE_DEMO_JOB_DESCRIPTION,
    jobDescriptionSource: "user",
    /* Deliberately NOT seeding aboutYouAnswer: the capture flow skips the
     * "Tell me about yourself" step when it already has one, and that step is
     * part of what the demo is showing. The composer supplies the same intro
     * as its prefill, so the answer still ends up identical — it just gets
     * typed on screen instead of appearing from nowhere. */
    storyboardFocusCompetencies: [...FINANCE_DEMO_FOCUS_IDS],
    coreFourCompetencies: [...FINANCE_DEMO_FOCUS_IDS],
    createdAt: existing?.createdAt ?? "2026-09-02T09:12:00.000Z",
  };
}

/**
 * Put storage at the START of this persona's journey: the profile, the posting
 * and the four focus competencies are in place, but nothing is captured yet —
 * so the Storyboard opens at the greet and the whole pre-filled run is ahead
 * of you. Deliberately a hard write rather than a role-keyed effect: a demo
 * has to be reproducible on the second try, and an effect that only fires when
 * the bank is empty is not.
 *
 * Caller is expected to hard-navigate afterwards so every screen re-reads.
 */
export function seedFinanceDemoStorage(): void {
  if (typeof window === "undefined") return;
  const profile = financeDemoRoleProfile(null);
  const set = (key: string, value: unknown) =>
    window.localStorage.setItem(key, JSON.stringify(value));

  // Clear anything that could contradict the seed (another role's dives, an
  // in-progress craft, a stale report).
  for (const key of [
    "proofdive.storyboardDraft.v2",
    "proofdive.storyboardFromCraft.v1",
    "proofdive.storyboardCraftEditing.v1",
    "proofdive.reports.v1",
    "proofdive.coachJourneyView.v1",
    "proofdive.coachFinalReadinessReportId.v1",
  ]) {
    window.localStorage.removeItem(key);
  }

  // sessionStorage matters too: `preferStoryboardIntake` survives a
   // localStorage wipe and makes the Storyboard open in capture mode instead of
   // the hub — which is exactly the wrong first screen for a demo.
  try {
    window.sessionStorage.removeItem("proofdive.preferStoryboardIntake.v1");
  } catch {
    // ignore
  }

  set("proofdive.roleProfile.v1", profile);
  set("proofdive.savedRoles.v1", [profile]);
  // Nothing captured and no Dives: the run starts where the client should see
  // it start, at the first question.
  set("proofdive.experiences.v1", []);
  set("proofdive.storyboardDives.v2", { schemaVersion: 2, byRole: {} });
  set("proofdive.candidate.storyboardGenerations.v1", 0);
}

/**
 * The answer already sitting in the composer for whatever the flow is asking.
 *
 * This is demo scaffolding and nothing else. The product deliberately ships
 * with an empty composer — the audit found a prefilled answer meant one Send
 * submitted invented evidence — so this is reachable only from the demo route
 * and never from the default Storyboard.
 *
 * Answers come from the same fixture the finished Dive is built from, so the
 * run and its result are the same persona saying the same things.
 */
export type FinanceDemoPhase =
  | { kind: "greet" }
  | { kind: "title"; competencyId: CompetencyId }
  | { kind: "car"; competencyId: CompetencyId; field: "context" | "action" | "result" }
  | { kind: "consultant"; competencyId: CompetencyId; qIndex: number }
  | { kind: "aboutYou" }
  | { kind: "closing" };

export function financeDemoPrefill(phase: FinanceDemoPhase): string {
  switch (phase.kind) {
    case "greet":
      // Short on purpose: the greet only needs acknowledging, and a long
      // paragraph here would make the first Send look like the real answer.
      return "Ready when you are.";
    case "title":
      return STORY_META[phase.competencyId]?.title ?? "";
    case "car":
      return BY_ID[phase.competencyId]?.car[phase.field] ?? "";
    case "consultant":
      return FOLLOW_UPS[phase.competencyId]?.[phase.qIndex] ?? "";
    case "aboutYou":
      return FINANCE_DEMO_INTRO;
    case "closing":
      return "";
  }
}

/**
 * Overlay this persona's real assessments onto a Dive the capture flow just
 * built.
 *
 * Without it the demo crafts to 4.9/5, because the live path scores CAR text
 * heuristically and these answers are long and specific. That number is both
 * implausible and the wrong story to tell a client: it hides the thing worth
 * showing, which is the assessment — the level, the evidence quoted back, the
 * classification rationale, and what is still missing. Demo mode only.
 */
export function applyFinanceDemoAssessments(dive: StoryboardDive): StoryboardDive {
  // Never judge another persona's Dive with this persona's assessments.
  if (dive.targetRole !== FINANCE_DEMO_ROLE) return dive;
  const next: StoryboardDive = {
    ...dive,
    intro: { ...dive.intro },
    competencies: dive.competencies.map((section, i) => {
      const spec = COMPETENCY_SPECS[i];
      const fixture = spec ? BY_ID[spec.id] : undefined;
      if (!fixture?.assessment) return section;
      // And never attach a written assessment to a story that was not told:
      // an empty section with a score counts as evidence downstream and would
      // drag phantom competencies into the overall and pillar averages.
      const told =
        section.car.context.trim() ||
        section.car.action.trim() ||
        section.car.result.trim();
      if (!told) return section;
      // Keep whatever the user actually typed; replace only the judgement.
      return {
        ...section,
        score: fixture.score,
        matchedSignals: [...fixture.matchedSignals],
        missingNextLevelSignals: [...fixture.missingNextLevelSignals],
        secondaryCompetencies: [...fixture.secondaryCompetencies],
        developmentRecommendation: fixture.developmentRecommendation,
        assessment: fixture.assessment,
      };
    }),
  };
  return recomputeDiveScores(next);
}
