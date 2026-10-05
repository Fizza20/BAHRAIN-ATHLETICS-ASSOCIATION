import { cleanAthleticsLinks as L } from "@/db/seed-data/real";

/**
 * Clean Athletics content. Structure and external links follow baa.bh/anti-doping.
 * Body copy is plain-language guidance based on the World Anti-Doping Code framework,
 * written for this prototype. BAA should review it against its official documents.
 */
export type Topic = {
  slug: string;
  title: string;
  short: string;
  legacy: string; // original baa.bh URL
  lead: string;
  sections: { heading: string; body: string[] }[];
  actions?: { label: string; href: string }[];
};

export const TOPICS: Topic[] = [
  {
    slug: "code-of-conduct",
    title: "Code of Conduct",
    short: "Ethical standards for athletes, coaches and officials",
    legacy: "https://www.baa.bh/about-7",
    lead: "Everyone in Bahraini athletics, from athletes to coaches, officials and administrators, is expected to act with integrity, respect and fairness.",
    sections: [
      { heading: "Who it applies to", body: ["Athletes, athlete support personnel (coaches, medical staff, managers), technical officials, volunteers and BAA staff and board members when acting in an athletics context."] },
      { heading: "What it covers", body: ["Fair play and respect for opponents and officials.", "Zero tolerance of doping, betting-related manipulation and corruption.", "Safeguarding: protecting young athletes and vulnerable adults from harm.", "Respectful conduct online and in the media."] },
    ],
  },
  {
    slug: "anti-doping-rules",
    title: "Anti-Doping Rules",
    short: "The rules every athlete competes under",
    legacy: "https://www.baa.bh/copy-of-code-of-conduct",
    lead: "Bahraini athletics follows the World Anti-Doping Code, implemented nationally by the Bahrain Anti-Doping Agency (B-NADO) and internationally by the Athletics Integrity Unit (AIU).",
    sections: [
      { heading: "Strict liability", body: ["Athletes are responsible for any prohibited substance found in their sample, whether or not they intended to use it. Check everything you take."] },
      { heading: "Anti-doping rule violations", body: ["The Code defines several violations, including presence or use of a prohibited substance, evading or refusing sample collection, whereabouts failures, tampering, possession, trafficking and complicity."] },
      { heading: "Testing", body: ["Athletes can be tested in or out of competition, at any time and place. You have rights during testing, including having a representative present."] },
    ],
    actions: [{ label: "WADA Prohibited List", href: L.wada }],
  },
  {
    slug: "check-your-medication",
    title: "Check Your Medication",
    short: "Verify a medicine before you take it",
    legacy: "https://www.baa.bh/copy-of-anti-doping-rules",
    lead: "Before taking any medicine, prescribed or over the counter, check whether it contains a substance on the WADA Prohibited List.",
    sections: [
      { heading: "How to check", body: ["Tell your doctor or pharmacist you are an athlete subject to anti-doping rules.", "Check the active ingredients against the current WADA Prohibited List, which is updated every year.", "If in doubt, contact B-NADO before taking the medicine."] },
      { heading: "Brands differ by country", body: ["The same brand name can contain different ingredients in different countries. Re-check medicines bought abroad."] },
    ],
    actions: [{ label: "Contact B-NADO", href: L.bnado }],
  },
  {
    slug: "supplements-policy",
    title: "Supplements Policy",
    short: "Understand the risks of supplements",
    legacy: "https://www.baa.bh/copy-of-check-your-medication",
    lead: "Supplements are a common cause of positive tests. Contamination and mislabelling happen, and strict liability still applies.",
    sections: [
      { heading: "Food first", body: ["Speak to a qualified sports nutritionist before using any supplement. Most needs can be met through diet."] },
      { heading: "Reduce the risk", body: ["Use only batch-tested products from reputable manufacturers, keep receipts and batch numbers, and never buy from unverified online sellers."] },
    ],
  },
  {
    slug: "therapeutic-use-exemptions",
    title: "Therapeutic Use Exemptions",
    short: "When a prohibited medicine is medically necessary",
    legacy: "https://www.baa.bh/copy-of-supplements-policy",
    lead: "If you need a prohibited substance or method to treat a medical condition, you may apply for a Therapeutic Use Exemption (TUE).",
    sections: [
      { heading: "Where to apply", body: ["International-level athletes apply to the Athletics Integrity Unit. National-level athletes apply to B-NADO."] },
      { heading: "What you need", body: ["A completed TUE application signed by your physician, with medical evidence supporting the diagnosis and treatment. Apply in advance unless it is an emergency."] },
    ],
    actions: [
      { label: "AIU", href: "https://www.athleticsintegrity.org/" },
      { label: "B-NADO", href: L.bnado },
    ],
  },
  {
    slug: "ineligible",
    title: "Currently Ineligible to Compete",
    short: "Athletes and personnel serving sanctions",
    legacy: "https://www.baa.bh/violations",
    lead: "BAA publishes the list of ineligible athletes and support personnel, with the violation, sanction and period of ineligibility.",
    sections: [
      { heading: "About this list", body: ["Ineligible persons may not take part in any capacity in competitions or activities authorised by BAA or its members during their period of ineligibility.", "In this prototype the list is managed from the admin dashboard. Entries are not reproduced here; see the current official list on baa.bh."] },
    ],
    actions: [
      { label: "Current list on baa.bh", href: "https://www.baa.bh/violations" },
      { label: "AIU global list", href: "https://www.athleticsintegrity.org/" },
    ],
  },
  {
    slug: "whistleblowing",
    title: "Whistleblowing",
    short: "Protected, confidential reporting",
    legacy: "https://www.baa.bh/copy-of-supplements-policy-1",
    lead: "Your voice matters in the fight against doping in sports. If you witness any violations, we urge you to report them.",
    sections: [
      { heading: "Your protection", body: ["Reports can be made confidentially. Whistleblowers acting in good faith are protected from retaliation under the World Anti-Doping Code."] },
      { heading: "What to report", body: ["Doping, the supply of prohibited substances, competition manipulation, betting-related corruption, age manipulation, harassment or abuse."] },
    ],
    actions: [
      { label: "WADA Speak Up!", href: L.wadaSpeakUp },
      { label: "Report to AIU", href: L.aiu },
    ],
  },
  {
    slug: "report-doping",
    title: "Report Doping in Athletics",
    short: "Where and how to make a report",
    legacy: "https://www.baa.bh/copy-of-clean-athletics",
    lead: "Concerns about doping can be reported directly to the independent bodies responsible for investigating them.",
    sections: [
      { heading: "B-NADO", body: ["The Bahrain Anti-Doping Agency is the competent and independent authority responsible for implementing the provisions of the International Code for Combating Doping in Sports."] },
      { heading: "Athletics Integrity Unit", body: ["The AIU protects athletics against all forms of integrity violations, such as doping, betting, bribery, corruption, age manipulation, match-fixing and harassment."] },
      { heading: "WADA", body: ["The World Anti-Doping Agency was established in 1999 as an independent international agency to lead a collaborative global movement for doping-free sport."] },
    ],
    actions: [
      { label: "Report to B-NADO", href: L.bnado },
      { label: "Report to AIU", href: L.aiu },
      { label: "WADA Speak Up!", href: L.wadaSpeakUp },
    ],
  },
];

export const PARTNERS = [
  { name: "B-NADO", full: "Bahrain Anti-Doping Agency", href: L.bnado },
  { name: "AIU", full: "Athletics Integrity Unit", href: L.aiu },
  { name: "WADA", full: "World Anti-Doping Agency", href: L.wada },
];
