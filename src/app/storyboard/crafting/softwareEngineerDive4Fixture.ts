/**
 * Dive 4 content from Storyboard-Software-Engineer-Dive-4-2026-08-11 (2).pdf
 * Used to seed the crafting review page for Software Engineer.
 */

import {
  COMPETENCY_SPECS,
  emptyCompetencySection,
  recomputeDiveScores,
  type CompetencyAssessment,
  type CompetencyId,
  type CompetencySection,
  type StoryboardDive,
} from "@/lib/storyboardDraft";

export const SOFTWARE_ENGINEER_DIVE4_ID = "cdde93f0-0dac-4fda-9660-ed2141675dde";
export const SOFTWARE_ENGINEER_DIVE4_ROLE = "Software Engineer";
export const SOFTWARE_ENGINEER_DIVE4_CANDIDATE = "Haisam Tayyab";

const INTRO_TEXT = `I'm a software engineer who has been taking on hands-on backend and system design problems, with a strong focus on building reliable applications and making practical decisions when systems are under pressure. A big part of my experience has been working through real production and delivery challenges, then turning them into clearer, more scalable solutions. One example was analyzing a recurring application failure by reviewing service behavior, infrastructure capacity, CPU usage, and load patterns to narrow the issue down to the database layer. From there, I helped stabilize the system with a bigger database instance as the immediate fix, and then improved longer-term scalability through sharding and indexing. In another project, I took ownership of separating an AI processing service from a Django-based backend so it could scale independently instead of forcing the whole server to scale together. I've also worked closely with clients and stakeholders to prioritize the right work, especially when timelines were tight, by clarifying trade-offs and focusing teams on the highest-impact deliverables first. That combination of troubleshooting, scalable thinking, API/service integration, and communication is what draws me to this Software Engineer role. I'm excited about opportunities where I can write solid software, solve performance issues, and contribute thoughtfully to systems as they grow.`;

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
    developmentRecommendation: assessment.development,
    assessment,
  };
}

const BY_ID: Partial<Record<CompetencyId, CompetencySection>> = {
  "thinking-analytical": assessed(
    {
      context:
        "I was working on a project where the system kept failing repeatedly, and my team needed to figure out why. The issue was affecting reliability, so my goal was to identify the root cause rather than just apply a temporary fix.",
      action:
        "I started by breaking the problem down into the main parts of the system and checking where the failures were likely coming from. I reviewed the infrastructure and the services running on it, including capacity, CPU usage, and timing of requests, to narrow down the failure point. That analysis pointed to the database as the main bottleneck. To confirm it, I added more load and watched how the database behaved under pressure, and it consistently broke down there. Once I was confident we had the right culprit, I helped implement fixes at the database level. We introduced sharding and horizontal scaling so requests and load could be distributed more evenly, and we also added indexing across the database to make queries faster and reduce pressure during transactions. I focused on validating each step so we were solving the real cause, not just masking the symptom.",
      result:
        "After those changes, the system became much more manageable under heavier request loads, and the repeated failures stopped happening in the same way. The experience reinforced for me the value of using structured analysis, testing assumptions, and confirming the root cause before choosing a solution.",
    },
    {
      levelLabel: "Insightful",
      score: 4,
      evidence:
        "You showed Analytical Thinking beyond one incident by explaining the trade-offs between short-term stabilization and longer-term scalability in another technical example. You separated what vertical scaling solved immediately from what sharding was meant to solve over time, which shows you were identifying the underlying cause, weighing options, and choosing based on the situation. You also connected architecture constraints in another story when you recognized that keeping AI processing and the API on the same server created a scaling problem.",
      classificationRationale:
        "Your initial score already showed solid reasoning. What lifted you to 4.0 was the added evidence from another experience where you clearly explained why you used one approach for the immediate issue and another for long-term scale. That demonstrates explicit trade-off evaluation and cause-based reasoning, which makes Insightful the best fit. I did not move higher because you did not yet show a reusable thinking model or broader synthesized insight that others could independently apply.",
      missingStrengths:
        "To move toward 5.0 - Elevates, show how you turn messy technical inputs into a reusable framework that others could apply on their own. For example, it would help to explain a repeatable way you assess incidents or scaling choices, how you anticipated downstream impact across teams or systems, and how your reasoning created insight others could use beyond that one case.",
      development:
        "Next time you describe a root-cause fix, turn it into a repeatable framework: lay out the steps you used to diagnose the incident, the criteria you used to choose sharding, horizontal scaling, and indexing, and the downstream impact you expected on performance, support, and future incidents. That helps others apply your thinking to a new problem, not just understand this one fix.",
      masterclass:
        "Work through the Root Cause Analysis to Reusable Problem-Solving Framework lesson, especially the section on making your reasoning transferable and thinking through downstream impact. That will help you explain not only what you changed, but how you decide in a way other teams can reuse.",
      aiCoach:
        "Rewrite this example in a simple Incident Playbook format: symptom → investigation steps → decision criteria → fix chosen → impact expected. Add one note on how your choice would affect other teams or future load patterns. This will give you evidence of a reusable method, not just a one-off resolution.",
      relatedCompetenciesNarrative:
        "You can also use this story to show Decision-Making Agility and Technical Application. You made a timely call to validate the database as the bottleneck instead of guessing, and you applied practical technical fixes like sharding, horizontal scaling, and indexing to solve the issue. It also gives you some evidence for Prioritization, since you focused on finding the root cause rather than patching symptoms.",
      relatedQuestionTypes:
        "You can pull this out for problem-solving, root-cause analysis, troubleshooting, and technical decision-making questions. For example, it fits well if you're asked, \"Tell me about a time you diagnosed a difficult system issue,\" or \"How have you decided between a quick fix and a longer-term solution?\"",
    },
    ["thinking-decision", "mastery-execution", "thinking-prioritization"],
  ),

  "thinking-decision": assessed(
    {
      context:
        "I was working in a busy area where we had a high throughput of around 100 people, and I accidentally spilled coffee on the floor. Because the area needed to stay safe and usable, I had to decide quickly how to handle it without disrupting everyone around me.",
      action:
        "I immediately judged that the spill was a safety issue and that waiting would create a slip hazard. My first step was to go to the storage area and get the mop as quickly as I could, rather than pause to look for help or assume someone else would handle it. Once I had the mop, I came back and cleaned the floor in about 10 to 15 seconds, then made sure it had time to dry before people moved through the area again. I was prioritizing speed, safety, and minimizing disruption. In that moment, I didn't overthink the decision — I weighed the risk of delay against the small amount of time needed to fix it, and chose the fastest practical response.",
      result:
        "The spill was cleaned up within about five minutes of happening, and the area was made safe again before it could affect foot traffic. I learned that in a busy environment, making a quick, sensible decision matters because even a small issue can become a bigger risk if it is left too long.",
    },
    {
      levelLabel: "Adaptive",
      score: 4,
      evidence:
        "You showed stronger decision-making agility in your technical examples than in the weaker spill example. In the service-splitting story, you identified the constraint that both workloads were on the same server, considered the consequence of scaling everything together, and chose to separate the AI service so it could scale independently. In the database story, you were also clear about multiple options and their purpose: vertical scaling for the immediate shutdown problem and sharding for longer-term scalability. That shows you can make decisions using available information, explain your reasoning, and balance short-term and longer-term consequences.",
      classificationRationale:
        "Your initial score was only partial, but your other stories provide much stronger evidence. You explicitly described options, trade-offs, and the difference between immediate and long-term consequences, which supports a full Level 4. I do not yet see clear evidence of broader judgment leadership or helping others evaluate decisions, so 4.0 is the best fit.",
      missingStrengths:
        "To reach 5.0, you would need to show that you consistently make decisions in a way that reflects broader principles or outcomes, not just technical fixes. The biggest missing pieces are showing that you anticipated likely consequences before committing, helped other people think through the decision, or maintained strong decision quality while juggling heavier complexity or competing pressures. A stronger story would include what options were on the table, what risks you forecast, and how your decision shaped the wider outcome.",
      development:
        "Next time, make your decision visible by stating the options you considered, the risks you anticipated, and the broader outcome you were protecting before you acted. For example: explain why you chose to mop immediately instead of waiting, how you weighed safety, throughput, and disruption, and how that choice prevented a wider problem for others.",
      masterclass:
        "Work through the Decision-Making Under Uncertainty lesson, especially the section on Trade-offs and Consequences, so you can show how you compare options, forecast impact, and choose the path that best protects the wider outcome.",
      aiCoach:
        "Rewrite your spill example in 3 parts: Situation, Options/Risks, and Decision/Outcome. In the middle section, list at least two alternative actions you could have taken, the consequence you expected from each, and why your final choice was the best one for the people affected.",
      relatedCompetenciesNarrative:
        "You can also use this story to show Ownership & Drive, because you stepped in immediately and took responsibility for fixing the spill without waiting to be told. It can also support Prioritization, since you quickly weighed safety and disruption and focused on the most important outcome first. If you need a lighter example of Communicates with Impact, you could mention how you kept the area clear and made sure others understood the space was safe again, but this story is strongest for the first two beyond your main competency.",
      relatedQuestionTypes:
        "You can pull this out for decision-making under pressure, prioritization, and ownership/proactivity questions — for example, if you're asked, \"Tell me about a time you had to make a quick decision with limited information,\" or \"Describe a time you took initiative to solve a problem before it got worse,\" this is a good fit.",
    },
    ["action-ownership", "thinking-prioritization", "people-influence"],
  ),

  "thinking-prioritization": assessed(
    {
      context:
        "On a project with multiple client requests competing for the same release window, I had to decide how to balance bugs, feature enhancements, and client expectations. We had a fixed deadline, and I needed to make sure we focused on work that protected the release and the user experience.",
      action:
        "I reviewed each item against business impact, urgency, dependencies, and release risk so I could prioritize objectively rather than react to whichever request felt loudest. When lower-impact enhancements and non-critical improvements came up, I pushed them to the next cycle because they were useful but not essential to the upcoming release. When two high-priority items competed, I looked at which one had the more immediate effect on the release and whether either item was blocking other work. For example, when we had to choose between fixing an issue affecting an existing workflow and adding a new enhancement, I prioritized the issue because it was already disrupting current users and carried more customer risk. I also explained the trade-offs clearly to stakeholders, making it explicit that delivering the enhancement first would delay the fix and increase the impact on customers. That helped the team align on the decision, and I documented deferred items so they could be revisited in the next cycle.",
      result:
        "We focused the team on the highest-impact work, kept the existing workflow stable, and met the release deadline without compromising quality. Just as importantly, stakeholders understood why some requests were deferred, which reduced pushback and set clearer expectations for the next cycle.",
    },
    {
      levelLabel: "Disciplined with emerging Principles Driven evidence",
      score: 4.5,
      evidence:
        'You showed several Level 5 signals. You linked your choices to broader outcomes when you said the decision supported "the bigger business outcome of keeping the existing workflow stable and avoiding disruption for current users." You also showed that you anticipated downstream consequences by naming risks like "customer dissatisfaction and support problems" and by considering whether work was "blocking other work." You maintained focus on highest-value outcomes amid complexity by describing how you reviewed competing requests using "business impact, urgency, dependencies, and release risk" and kept attention on "high-impact work" under a fixed release deadline. You also showed some evidence of helping others prioritize when you said you explained the trade-off and "helped the team agree to move the enhancement to the next cycle."',
      classificationRationale:
        "You are firmly at Level 4, and your examples show emerging Level 5 evidence across a majority of the next-level signals. You went beyond simple urgency-based sorting and showed that you connected priorities to business outcomes, thought about downstream effects, and kept the team focused on the highest-value work in a crowded release. The move does not reach full Level 5 because some of that evidence stayed broad rather than highly specific, and your example of helping others prioritize showed influence but not yet a clearly demonstrated, reusable approach. That makes 4.5 the best fit.",
      missingStrengths:
        "To reach full Level 5, you would need to make every signal more fully demonstrated and concrete. The main gap is in helping others make clearer prioritization decisions: you showed that your explanation helped the team agree, but you did not yet show a repeatable method, framework, or decision rule that others could use themselves. You could strengthen this by describing exactly how you guided stakeholders through the choice — for example, the criteria, threshold, or comparison you used to align everyone. Your downstream consequences were also directionally strong, but still fairly general; to lock in the full level, add more specific consequences such as what would have slipped, who would have been affected, or what support, delivery, or customer outcome would have changed if you had chosen differently.",
      development:
        'Next time, make your prioritization method repeatable for others: spell out the decision rule you used (for example, "fix anything already affecting users before enhancements unless the enhancement is blocking a higher-value dependency"), walk stakeholders through the same criteria each time, and name the specific downstream consequence of choosing the other option so they can see why the trade-off protects business value.',
      masterclass:
        "Work through the Prioritization: Helping Others Decide lesson, especially the section on trade-offs, decision criteria, and stakeholder alignment, so you can turn your judgment into a clear framework others can follow.",
      aiCoach:
        "Rewrite your example in three parts: 1) the two options you compared, 2) the exact rule/criteria you used to choose one over the other, and 3) the concrete consequence of the alternative choice (who would have been affected, what would have slipped, and what business outcome would have worsened).",
      relatedCompetenciesNarrative:
        "You can also use this story to demonstrate Analytical Thinking, because you broke the requests down by impact, urgency, dependencies, and release risk before choosing a path. It also supports Communicates with Impact, since you clearly explained the trade-offs to stakeholders and helped everyone align on the decision. You can lean on Decision-Making Agility too, because you made a timely call under competing demands and uncertainty. It also shows Ownership & Drive a bit, since you took responsibility for driving the release forward and documenting deferred items so the work kept moving.",
      relatedQuestionTypes:
        "You can pull this out for prioritization questions, trade-off questions, and decision-making under pressure questions — for example, if you're asked, \"Tell me about a time you had to choose between competing priorities,\" or \"How do you decide what to defer when deadlines are fixed?\" this is a strong answer. It also works well for stakeholder alignment questions, like, \"Tell me about a time you had to get others comfortable with a difficult decision.\"",
    },
    ["thinking-analytical", "people-influence", "thinking-decision", "action-ownership"],
  ),

  "action-ownership": assessed(
    {
      context:
        "On one project, our application had an AI service and the core backend running on the same server. As usage grew, we realized we couldn't scale the AI workload independently without also scaling the main backend, which would create unnecessary cost and operational risk. As tech lead, I took ownership of finding a better architecture.",
      action:
        "I initiated the move to split the AI functionality into a separate service so it could be scaled on its own. I worked with the team to validate that the change was worth making, then drove the delivery of the separate instance and the infrastructure needed to support it. My focus was on making sure the new service could communicate cleanly with the main backend API, so I coordinated the integration points and checked that the application could talk to the service reliably after the split. I kept pushing the work forward because I knew the goal wasn't just to create a separate component, but to make sure it was actually usable in production and reduced the dependency between the two workloads.",
      result:
        "We ended up with a separated AI service that could be scaled independently without scaling the core backend. That gave us a more flexible setup for handling demand and a cleaner service boundary. It also reinforced for me that, as a tech lead, I need to take initiative early when a shared architecture becomes a bottleneck and drive the change through to completion.",
    },
    {
      levelLabel: "Proactive",
      score: 4,
      evidence:
        "You showed Proactive ownership by spotting a scaling problem, recognizing that the current setup would force unnecessary full-server scaling, and then taking initiative to separate the AI service. You were clear that you acted as the tech lead, helped validate the approach, created separate infrastructure, and drove the delivery of a new service plus its integration with the main API. That shows you did not just wait for direction — you moved the work forward through ambiguity and owned the solution through to implementation.",
      classificationRationale:
        "Your initial score already reflected solid responsibility with some emerging higher-level behavior. The broader set of examples makes your initiative and self-directed ownership clearer and more explicit, especially in the service-separation story. I do not yet see enough evidence of wider outcome orchestration or helping others complete work to justify Level 5 signals, so 4.0 is the best fit.",
      missingStrengths:
        "To reach 4.5 or 5.0, you would need to show stronger evidence that your ownership extended beyond your own deliverable into broader outcome leadership. The biggest gaps are showing that you anticipated risks early, created momentum for other people to finish well, and stayed focused on business or customer outcomes rather than mainly the technical task. A stronger example would include how you handled blockers, aligned teammates, or protected the project from downstream delivery risk.",
      development:
        "Next time, make your ownership visible beyond the technical build by stating the risk you anticipated early — for example, downstream service dependency, deployment coordination, or performance impact — and then explain how you protected the project from that risk by aligning teammates, sequencing the work, or removing blockers before they slowed delivery.",
      masterclass:
        "Work through the Ownership & Drive lesson on anticipating risks and driving broader delivery outcomes. Focus especially on the parts about proactive risk management, enabling others to finish, and keeping the conversation centered on business or customer impact rather than only the implementation.",
      aiCoach:
        "Rewrite your example in a short Before / Action / Result format. In the Action section, add one sentence on a risk you saw early, one sentence on how you helped other people move forward, and one sentence on the customer or business outcome your separate service protected or improved.",
      relatedCompetenciesNarrative:
        "You can also use this story to show Decision-Making Agility and Prioritization, because you weighed the scaling trade-off, judged that the shared server was becoming a bottleneck, and chose the higher-value architectural change. It can also support Technical Application and Functional Knowledge, since you applied sound system design thinking to split the service, handle integration cleanly, and make the new setup production-ready. If you want to lean into Analytical Thinking, you can frame how you identified the root constraint and reasoned through the architecture change.",
      relatedQuestionTypes:
        "You can pull this out for trade-off, problem-solving, technical design, and leadership questions — for example: \"Tell me about a time you improved a system by making a hard architectural decision,\" \"Describe a time you had to weigh cost versus scalability,\" or \"Give me an example of when you took initiative to fix a bottleneck before it became a bigger problem.\"",
    },
    ["thinking-decision", "thinking-prioritization", "mastery-execution", "mastery-functional"],
  ),

  "people-influence": assessed(
    {
      context:
        "On a large Innova project, the client was frustrated because they had committed a full data migration scope to their stakeholders and wanted everything delivered by a specific date. At the same time, my team was worried we would not be able to complete the entire scope on time because of resource constraints.",
      action:
        "I set up a call with the client to bring clarity to the situation and reduce confusion. Before the call, I created an Excel sheet listing the high-level modules of the deliverable so I could walk through them one by one. During the discussion, I explained the constraint clearly: we could not commit to delivering the full scope by that date, but if we prioritised the items, we could still deliver the most important work on time. I went through each module with the client, asked them to confirm what mattered most, and helped separate the truly urgent items from the ones that could wait. I kept the conversation simple and direct so the client understood the trade-off without feeling overwhelmed. Based on that discussion, I recommended focusing on the migration module first and postponing the lower-priority items until after the deadline. That approach kept the client informed, aligned expectations, and gave them confidence that we had a realistic plan.",
      result:
        "The client agreed with the prioritisation, confirmed that the migration module was the priority for the deadline, and allowed the rest of the scope to be handled later. We were able to deliver the high-priority items on time, and the client was happy with the plan because it was clear, practical, and honest.",
    },
    {
      levelLabel: "Expressive with emerging Adaptive evidence",
      score: 3.5,
      evidence:
        "You moved beyond a basic communication example by showing that you can structure a message clearly and help a conversation become productive. You organized the discussion with an Excel sheet, walked through items one by one, explained the constraint, laid out the choice, and got to a clear agreement. You also showed emerging adaptive communication because you recognized the client was frustrated and adjusted the discussion toward what mattered most to them, instead of pushing the full scope conversation. That shows solid Level 3 communication with some clear signs of Level 4.",
      classificationRationale:
        "Your initial score was lower, but another example gives stronger evidence. You clearly structured the conversation, explained the tradeoff in understandable terms, and facilitated agreement. I also see some audience awareness and adjustment, but not enough detail yet to say adaptive communication is fully proven, so 3.5 fits best.",
      missingStrengths:
        "To reach 4.0, you would need to show more clearly how you adapted your style in the moment based on the client's reactions, questions, or concerns. For example: what did the client misunderstand at first, how did you rephrase it, and how did you tailor the message differently for that audience? To go beyond that later, stronger evidence would show that your communication created lasting alignment and influenced decisions across people, not just agreement in one meeting.",
      development:
        'Next time, show how you adapted in the moment: name what the client seemed worried about or misunderstood, then explain how you rephrased your message to match their concern. For example, you could say, "When the client kept focusing on the full scope, I paused and reframed the discussion around the one deliverable they had promised to stakeholders, then used the priority list to show what we could commit to and what would move later." That gives clear evidence that you adjusted your style to help them understand and decide.',
      masterclass:
        "Work through the Audience Adaptation lesson, especially the part on reading reactions and rephrasing on the spot. That will help you show how you changed your message based on the client's concern, rather than only showing that you explained the issue clearly once.",
      aiCoach:
        "Rewrite your story as a short call sequence with three parts: what the client first worried about, how you changed your explanation, and what the client said or did after your reframe. Aim to include one exact phrase you used to make the message simpler for that audience.",
      relatedCompetenciesNarrative:
        "You can also use this story to demonstrate Prioritization and Decision-Making Agility, because you weighed the deadline, resource constraint, and scope trade-offs, then made a clear recommendation on what should come first. It also shows a bit of Analytical Thinking, since you broke the deliverable into modules and used that structure to guide the discussion.",
      relatedQuestionTypes:
        "You can pull this out for prioritization, trade-off, and stakeholder alignment questions — for example, if you're asked, \"Tell me about a time you had to decide what to do first under tight constraints,\" or \"Describe a time you aligned a client around a difficult decision.\"",
    },
    ["thinking-prioritization", "thinking-decision", "thinking-analytical"],
  ),

  "mastery-functional": assessed(
    {
      context:
        "In a production application, we were seeing repeated failures during periods of heavy user traffic. The service was unstable, and I was brought in to diagnose whether the issue was in the application itself or in the supporting database and infrastructure. Because the failures were recurring, I needed to quickly identify the real bottleneck and apply a fix that would stabilize the system.",
      action:
        "I started by reviewing the application services, infrastructure capacity, and database behavior together rather than looking at each layer in isolation. I checked for signs of CPU and memory pressure, database saturation, and whether query performance was degrading under load. That analysis showed the database was running on the lowest instance size, which was not sufficient for production traffic. Based on that, I chose vertical scaling as the immediate fix because it would address the resource constraints causing shutdowns without requiring a major redesign. I increased the database instance capacity to stabilize the system and reduce the pressure that was causing failures. I also introduced sharding as a longer-term scalability measure so data and query load could be distributed more effectively as traffic grew. In addition, I added indexes to reduce query time and improve database efficiency. Throughout the fix, I focused on using the right database concepts for the problem: capacity for stability, sharding for distribution, and indexing for query performance.",
      result:
        "After the changes, the repeated application failures stopped and the database became stable under production load. The incident reinforced for me how important it is to understand database sizing, scaling options, and query optimization well enough to choose the right fix for both immediate recovery and long-term reliability.",
    },
    {
      levelLabel: "Advanced",
      score: 4,
      evidence:
        "You showed Functional Knowledge at a stronger level by explaining not just what you did, but when and why each database approach should be used. You distinguished the role of vertical scaling, sharding, and indexes, linked them to specific technical outcomes, and made the trade-offs explicit: one choice stabilized the system quickly, while another addressed longer-term scalability. That is strong evidence that you understand how the concepts connect to engineering decisions and system quality.",
      classificationRationale:
        "Your initial score already showed solid technical understanding. I raised you to 4.0 because another part of your experience made the knowledge more explicit: you clearly explained the purpose, limits, and trade-offs of different database strategies and tied them to real engineering outcomes. I did not move higher because the evidence does not yet show a full end-to-end operating model or broader dependency thinking that would support Mastery.",
      missingStrengths:
        "To move toward 5.0 - Mastery, show the broader system view around these choices. For example, explain the dependencies with application design, deployment, data patterns, operations, or stakeholder decisions; describe any edge cases or risks; and show how using these concepts well improves the wider workflow, not just the database itself.",
      development:
        "Next time you explain a fix, add the system view: say how your database choice depended on the application design and data patterns (for example, read/write volume, query shape, growth rate), what the operational risk was, and how you aligned the change with deployment and stakeholder needs. That will show you understand not just the database itself, but how the decision affected the wider service.",
      masterclass:
        "Work through the Systems Thinking in Technical Decisions lesson, especially the section on dependencies, trade-offs, and risk. That's the best match for strengthening how you explain why a technical choice mattered across the whole workflow.",
      aiCoach:
        "Rewrite your incident story in three parts: root cause, why this fix fit the application and data pattern, and what risks or edge cases you considered. Include one sentence on how the change improved operations or reduced stakeholder impact, not just how it fixed the database.",
      relatedCompetenciesNarrative:
        "You can also use this story to show Analytical Thinking, because you broke the problem down across application, infrastructure, and database signals to find the real bottleneck. It also supports Decision-Making Agility and Technical Application, since you chose a practical fix under pressure and applied the right database techniques for both immediate stabilization and longer-term scaling. There's some Prioritization here too, because you focused first on the change that would stop the failures fastest. This story is less strong for Ownership & Drive or Communicates with Impact unless you add more detail about how you drove the work or influenced others.",
      relatedQuestionTypes:
        "You can also pull this story out for problem-solving, technical troubleshooting, trade-off, and systems design/scaling questions — for example, if you're asked, \"Tell me about a time you diagnosed a complex production issue,\" or \"How have you decided between quick stabilization and a longer-term fix?\" this is a strong answer.",
    },
    ["thinking-analytical", "thinking-decision", "mastery-execution", "thinking-prioritization"],
  ),

  "mastery-execution": assessed(
    {
      context:
        "During my internship, I was responsible for helping report weekly campaign performance. The challenge was that Meta, GA4, and Shopify all showed slightly different numbers, but my manager needed a clear view of which campaigns to scale, pause, or investigate. I had to turn messy cross-platform data into something decision-ready.",
      action:
        "I built a Google Sheet to consolidate the weekly reporting. I used campaign names and UTMs as the primary matching method, then checked date ranges and campaign names again to validate the joins across platforms. I cleaned duplicate rows so the comparisons were not skewed, and I made sure the key decision metrics were visible: spend, clicks, sessions, conversion rate, sales, and ROAS. When I found campaigns where the match was uncertain, I flagged them instead of forcing a confident-looking result. I also kept the discrepancies visible where attribution windows could explain the differences, and I added detailed channel notes in a second tab so the main view stayed focused on the scale/pause/investigate decision. That way, I was applying the right reporting method for the business question instead of trying to make all three systems look identical.",
      result:
        "The report made the weekly meeting much easier because my manager could quickly see which campaigns had clicks but were not converting into sales. It supported faster decisions on what to pause or scale, and it also created a clearer process for handling attribution differences rather than hiding them. I learned that technical accuracy is not just about combining data, but about structuring it so stakeholders can trust and use it.",
    },
    {
      levelLabel: "Sound with emerging Advanced evidence",
      score: 3.5,
      evidence:
        'You showed emerging Level 4 Technical Application in a few clear ways. You adapted your approach to stakeholder needs when you said the first need was the "scale, pause, or investigate decision" and so you prioritized decision metrics in the first tab while moving channel notes to a second tab. You also identified material risks and dependencies in the data when you said you matched on "UTM names first, then checked date ranges and campaign names," cleaned duplicates, and "flagged campaigns where I was not fully sure the match was correct." That is practical risk management, not just reporting. You also showed some adjustment for changing conditions by keeping conflicting numbers visible and noting that "attribution windows were different" so the report would not hide uncertainty.',
      classificationRationale:
        "Your score stays above the established Level 3 because you gave specific, role-based evidence of adaptation and risk handling in how you built the reporting sheet. You did more than list tools: you described how you matched records, checked accuracy, flagged uncertainty, and structured the output around the manager's decision need. That supports a majority of Level 4 signals. However, the evidence for trade-offs and for a concrete change in approach driven by changing conditions was only partial. When pushed on those points, you mostly repeated the report purpose and process rather than walking through a specific decision you changed and why. That makes the stronger reading emerging Advanced evidence, not full Level 4.",
      missingStrengths:
        "To reach full Level 4, you would need to show the trade-offs behind your technical choices more explicitly. For example, you hinted at a choice to keep uncertainty visible, but you did not fully explain why that was better than forcing one source of truth, or what you gained and gave up by prioritizing certain metrics over others. You would also need a clearer example of adjusting the approach because conditions changed — not just how you structured the report, but what discrepancy or constraint made you change your original method, rule, or recommendation. To move beyond this toward Level 5, you would need to show a more complete end-to-end solution: your assumptions, decision points for edge cases, how feedback or early results improved the setup, and how your technical choices affected broader outcomes like reporting quality, decision speed, or campaign performance through a clear mechanism.",
      development:
        "Next time, make your trade-offs explicit: say why you chose to keep uncertainty visible instead of forcing one source of truth, what you prioritized in the decision metrics, and what you gave up by not over-weighting the less reliable fields. Then add one concrete example of a changed approach — for instance, a discrepancy or duplicate pattern that made you revise your matching rule, filtering logic, or recommendation for pause vs. scale.",
      masterclass:
        "Work through the Trade-Offs, Assumptions, and Adjusting Your Approach section of the Technical Application lesson. That's the best place to sharpen how you explain why one method was better than another, and how a real data issue changed your plan.",
      aiCoach:
        "Rewrite your story in three parts: 1) the original method you planned, 2) the specific discrepancy or constraint that forced you to adjust it, and 3) the trade-off you made and why it protected decision quality. End with one sentence on how that choice improved the manager's ability to pause, scale, or investigate the right campaigns.",
      relatedCompetenciesNarrative:
        "You can also use this story to show Analytical Thinking, because you broke a messy data problem into matching, validation, and decision metrics, and Communicates with Impact, because you structured the report around what your manager needed to decide. It also supports Decision-Making Agility and Prioritization, since you chose not to force uncertain matches, kept discrepancies visible, and focused the output on scale/pause/investigate decisions. There's a light case for Ownership & Drive too, because you proactively built the reporting process instead of waiting for a perfect setup.",
      relatedQuestionTypes:
        "You can pull this out for problem-solving questions, data analysis questions, decision-making under uncertainty questions, and stakeholder communication questions. For example, it works well if you're asked, \"Tell me about a time you turned messy data into a clear recommendation,\" or \"Describe a time you had to make a decision with incomplete information.\"",
    },
    [
      "thinking-analytical",
      "people-influence",
      "thinking-decision",
      "thinking-prioritization",
      "action-ownership",
    ],
  ),
};

export function buildSoftwareEngineerDive4(): StoryboardDive {
  const competencies = COMPETENCY_SPECS.map(
    (spec) => BY_ID[spec.id] ?? emptyCompetencySection(),
  );
  return recomputeDiveScores({
    schemaVersion: 2,
    id: SOFTWARE_ENGINEER_DIVE4_ID,
    diveNumber: 4,
    targetRole: SOFTWARE_ENGINEER_DIVE4_ROLE,
    status: "saved",
    savedAt: "2026-08-11T17:58:00.000Z",
    intro: {
      locked: true,
      regenCount: 0,
      text: INTRO_TEXT,
    },
    competencies,
    overallScore: 0,
    pillarScores: {
      thinking: 0,
      action: 0,
      people: 0,
      mastery: 0,
    },
  });
}
