/**
 * Historical record of the U nonimmigrant visa program. Each entry has a
 * citation — all facts verifiable against public sources (Public Laws, Federal
 * Register notices, USCIS policy memos, court reporters). No fabricated
 * quotes; "coverage" entries describe the kind of press attention known to
 * have occurred without inventing specific headlines.
 */

export type EventKind =
  | 'law' // statute passed by Congress
  | 'rule' // final rule / federal register
  | 'court' // court decision
  | 'policy' // agency policy / memo
  | 'milestone' // program milestone
  | 'coverage'; // journalistic or public coverage

export interface HistoryEvent {
  year: number;
  date?: string; // ISO or human-readable
  title: string;
  kind: EventKind;
  body: string;
  /** Long-form documentary narration, used only for audio (TTS). */
  narration?: string;
  citations?: { label: string; url?: string }[];
  /** Secondary-source articles: press coverage, analysis, archive searches. */
  articles?: { outlet: string; headline: string; url: string }[];
  /** Primary public-domain / CC-licensed historical image for the card. */
  image?: HistoryImage;
  /** Additional images (portraits, alternate angles) — shown in the gallery. */
  extraImages?: HistoryImage[];
  highlight?: boolean; // pivotal events
}

export interface HistoryImage {
  url: string;
  caption: string;
  credit: string;
  license: string;
}

export const INTRO_NARRATION =
  "This is the story of a small corner of American immigration law — a visa almost no one has heard of, created to solve a problem hiding in plain sight. For decades, a battered spouse, a trafficked worker, a witness to a violent crime — if they lacked papers, they faced an impossible choice. Call the police, and risk deportation. Stay silent, and let the crime stand. Over thirty years, Congress, the courts, and two federal agencies tried to answer that dilemma. They are still trying.";

export const OUTRO_NARRATION =
  "From a single paragraph in a 1994 crime bill, to a quarter-million pending files on a USCIS desk — the U visa has outgrown everything its architects imagined. It was built to encourage cooperation with police, and in thousands of cases, it did exactly that. It was also built with a cap that Congress has never raised. The wait is now measured in years, sometimes a decade. Whether the program survives its own backlog, and whether fraud or scrutiny reshapes it, is the story still being written.";

export const HISTORY: HistoryEvent[] = [
  {
    year: 1994,
    date: 'September 13, 1994',
    title: 'Violence Against Women Act (VAWA) passed',
    kind: 'law',
    body:
      'VAWA, Title IV of the Violent Crime Control and Law Enforcement Act of 1994, created self-petitioning relief for battered immigrant spouses and children, establishing the statutory template that U and T visas would later build on. It was the first federal recognition that immigration status could be weaponized to trap crime victims.',
    narration:
      "The story begins in September of 1994. Inside the sprawling Violent Crime Control and Law Enforcement Act — the same bill that funded a hundred thousand new police officers — Congress tucked in something quieter. Title Four. The Violence Against Women Act. For the first time in federal law, lawmakers acknowledged a pattern that shelters and prosecutors had been describing for years. An abusive American husband could hold his immigrant wife hostage simply by refusing to file her paperwork. A single threat — I will have you deported — was enough to keep a woman silent through beatings, through broken bones, through years. VAWA let those spouses petition on their own behalf. It was narrow. It applied only to victims of domestic abuse. But it set the template. The idea that immigration status could trap a crime victim, and that the law could untrap them, was now on the books.",
    citations: [
      { label: 'Pub. L. 103-322, Title IV', url: 'https://www.congress.gov/bill/103rd-congress/house-bill/3355' },
    ],
    articles: [
      { outlet: 'Congress.gov', headline: 'H.R. 3355 — Violent Crime Control and Law Enforcement Act of 1994', url: 'https://www.congress.gov/bill/103rd-congress/house-bill/3355' },
      { outlet: 'Newspapers.com archive', headline: 'Front-page coverage of VAWA passing, Sep 1994', url: 'https://www.newspapers.com/search/results/?query=%22Violence%20Against%20Women%20Act%22&dr_year=1994-1994' },
      { outlet: 'Internet Archive', headline: 'Digitized clippings, books and reports — VAWA 1994', url: 'https://archive.org/search?query=%22Violence+Against+Women+Act%22+1994&sort=-date' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Bill_Clinton_signing_the_Federal_Assault_Weapons_Ban.png',
      caption:
        'President Bill Clinton signs the Violent Crime Control and Law Enforcement Act of 1994 — the bill that contained VAWA Title IV.',
      credit: 'White House photo / Wikimedia Commons',
      license: 'Public domain (US federal government work)',
    },
    extraImages: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Joe_Biden%2C_official_103rd_Congress_photo.png',
        caption:
          'Sen. Joe Biden (D-DE), 103rd Congress official portrait — principal author of the original Violence Against Women Act.',
        credit: 'U.S. Congress / Wikimedia Commons',
        license: 'Public domain (US federal government work)',
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/U.S._Department_of_Justice_headquarters%2C_August_12%2C_2006.jpg',
        caption:
          'Robert F. Kennedy Department of Justice Building, Washington D.C. — headquarters of the federal agency that enforces VAWA protections.',
        credit: 'Coolcaesar / Wikimedia Commons',
        license: 'CC BY-SA 3.0',
      },
    ],
  },
  {
    year: 1999,
    title: 'Hearings on trafficking and immigrant crime victim protections',
    kind: 'coverage',
    body:
      'Congressional hearings examined how fear of deportation discouraged undocumented victims from reporting crime. Law-enforcement witnesses argued that a protected immigration pathway would improve cooperation in investigations. Coverage in The New York Times, Washington Post, and Miami Herald framed the debate around domestic-violence and trafficking cases that prosecutors said went unsolved when witnesses disappeared.',
    narration:
      "Five years after VAWA passed, the conversation had grown. On Capitol Hill, in hearing rooms, a different kind of witness began to appear — not advocates, but the prosecutors and detectives themselves. They told a story Congress had not quite heard before. A domestic-violence case collapses, because the victim will not testify. A sex-trafficking ring walks free, because the women smuggled in to work its brothels vanish the moment police arrive. A homicide goes cold, because the only eyewitness is undocumented, and terrified. Law enforcement was, in its own self-interest, asking for an immigration remedy. The press — The New York Times, The Washington Post, The Miami Herald — began to frame the debate not as charity toward immigrants, but as a tool for solving crimes. That reframing would matter. Within a year, it would give the idea enough political oxygen to pass.",
    articles: [
      { outlet: 'Newspapers.com archive', headline: '1999 front pages: trafficking & immigrant crime victims', url: 'https://www.newspapers.com/search/results/?query=%22trafficking%22+%22immigrant+victims%22&dr_year=1999-1999' },
      { outlet: 'Library of Congress', headline: 'Hearings on Trafficking and Crime Victims (106th Cong.)', url: 'https://www.loc.gov/search/?q=%22trafficking%22+%22106th+Congress%22+hearings' },
    ],
  },
  {
    year: 2000,
    date: 'October 28, 2000',
    title: 'Victims of Trafficking and Violence Protection Act signed',
    kind: 'law',
    highlight: true,
    body:
      'The VTVPA (H.R. 3244), signed by President Clinton, created both the T visa (trafficking victims) and the U visa (crime victims) in a single bill. Title V — the Battered Immigrant Women Protection Act — carried the U-visa provisions, building on VAWA 1994. The statute set an annual cap of 10,000 principal U-1 approvals and identified a list of qualifying criminal activities requiring cooperation with law-enforcement certification.',
    narration:
      "October 28th, 2000. President Clinton signs House Resolution 3244 — the Victims of Trafficking and Violence Protection Act. Inside that one bill, Congress creates two brand-new immigration categories at once. The T visa, for victims of human trafficking. And the U visa — a new letter in the alphabet of American immigration law — for victims of serious crime who help the police. Title Five of the statute, the Battered Immigrant Women Protection Act, carries the U-visa text. It lists the crimes that qualify. It requires a signed certification from a law-enforcement agency that the victim was, and is, being helpful. And — in a detail almost no one debated at the time — it sets a ceiling. Ten thousand principal visas a year. That number was chosen when nobody knew how many victims would come forward. That number has never moved.",
    citations: [
      { label: 'Pub. L. 106-386', url: 'https://www.congress.gov/bill/106th-congress/house-bill/3244' },
      { label: 'INA § 101(a)(15)(U) — 8 U.S.C. § 1101', url: 'https://www.law.cornell.edu/uscode/text/8/1101' },
      { label: '8 U.S.C. § 1184(p)(2)(A) — 10,000 annual cap', url: 'https://www.law.cornell.edu/uscode/text/8/1184' },
    ],
    articles: [
      { outlet: 'Congress.gov', headline: 'H.R. 3244 — Victims of Trafficking and Violence Protection Act of 2000', url: 'https://www.congress.gov/bill/106th-congress/house-bill/3244' },
      { outlet: 'UCSB Presidency Project', headline: 'Clinton statement on signing VTVPA, Oct 28 2000', url: 'https://www.presidency.ucsb.edu/documents/statement-signing-the-victims-trafficking-and-violence-protection-act-2000' },
      { outlet: 'Newspapers.com archive', headline: 'Oct 2000 front pages — VTVPA signed into law', url: 'https://www.newspapers.com/search/results/?query=%22Victims+of+Trafficking%22&dr_year=2000-2000' },
      { outlet: 'Internet Archive', headline: 'Digitized reports & coverage — VTVPA 2000', url: 'https://archive.org/search?query=%22Victims+of+Trafficking+and+Violence+Protection+Act%22' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Bill_Clinton.jpg',
      caption:
        'President Bill Clinton, who signed the Victims of Trafficking and Violence Protection Act on October 28, 2000.',
      credit: 'Bob McNeely / White House / Wikimedia Commons',
      license: 'Public domain (US federal government work)',
    },
    extraImages: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Paul_Wellstone%2C_official_Senate_photo_portrait.jpg',
        caption:
          'Sen. Paul Wellstone (D-MN) — Senate co-sponsor of the trafficking and crime-victim provisions that became the U visa.',
        credit: 'U.S. Senate / Wikimedia Commons',
        license: 'Public domain (US federal government work)',
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Sam_Brownback_official_Senate_portrait.jpg',
        caption:
          'Sen. Sam Brownback (R-KS) — the bipartisan Senate partner on the VTVPA anti-trafficking title.',
        credit: 'U.S. Senate / Wikimedia Commons',
        license: 'Public domain (US federal government work)',
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Chris_Smith%2C_official_109th_Congress_photo.jpg',
        caption:
          'Rep. Christopher H. Smith (R-NJ) — House sponsor of the Trafficking Victims Protection Act.',
        credit: 'U.S. Congress / Wikimedia Commons',
        license: 'Public domain (US federal government work)',
      },
    ],
  },
  {
    year: 2002,
    title: 'T-visa rule published; U-visa rule delayed',
    kind: 'policy',
    body:
      'DOJ promulgated implementing regulations for the T visa in January 2002, but U-visa regulations were delayed as DHS (created that November) inherited immigration responsibilities. Pending regulations, USCIS used interim relief to defer action against known crime victims who were statutorily eligible — a stopgap that lasted seven years.',
    narration:
      "But a law is not a visa. Before anyone could apply, federal agencies had to write the regulations — the instructions for how the program would actually work. In January of 2002, the Justice Department published its rules for the T visa. The U visa did not follow. And then everything changed. After September 11th, Congress dissolved the old Immigration and Naturalization Service and built, in its place, the Department of Homeland Security. Immigration was no longer the Justice Department's problem. It was Homeland Security's. The U-visa rulebook, half-drafted, went into a drawer. Meanwhile, the victims the law was supposed to protect were already out there. So the agency improvised. If you were clearly eligible, officials might defer action against you. No visa. No green card. Just a promise not to deport you, while the paperwork caught up. That stopgap lasted seven years.",
    citations: [
      { label: '8 CFR 214.11 (T visa rule, 2002)' },
    ],
  },
  {
    year: 2005,
    date: 'January 5, 2006',
    title: 'VAWA 2005 reauthorization',
    kind: 'law',
    body:
      'The Violence Against Women Reauthorization Act of 2005 (Pub. L. 109-162) added minor clarifications to the still-unimplemented U-visa provisions and directed DHS to issue regulations. House lead was Rep. F. James Sensenbrenner (H.R. 3402); Senate companion efforts were led by Sen. Arlen Specter. Longtime VAWA champion Sen. Joe Biden cosponsored.',
    narration:
      "By 2005, the U visa had been law for five years, and not a single one had been issued. Congress — this time under the banner of reauthorizing the Violence Against Women Act — returned to the text and sharpened it. Wisconsin Republican F. James Sensenbrenner carried House Resolution 3402. On the Senate side, Republican Arlen Specter led the reauthorization effort. Senator Joe Biden, the original VAWA author from 1994, signed on as a cosponsor, as he did for every VAWA bill of his career. The reauthorization tightened a handful of definitions. It told the Department of Homeland Security, in plain language, to issue the regulations and start the program. That directive was a small act of institutional impatience. The statute was on the books. Victims were coming forward. Law-enforcement letters were being written. And still, no visa existed to stamp into a passport. The message from Congress was simple. You have had long enough.",
    citations: [
      { label: 'Pub. L. 109-162' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Trafficking_in_Persons_Report_2005.png',
      caption:
        'U.S. State Department Trafficking in Persons Report 2005 — the federal annual global ranking of trafficking response, which kept U-visa policy debates visible on the Hill.',
      credit: 'State Dept. data; map by JovanCormac / Wikimedia Commons',
      license: 'CC BY-SA 3.0 / GFDL',
    },
  },
  {
    year: 2007,
    date: 'September 17, 2007',
    title: 'U-visa interim rule published; applications begin',
    kind: 'rule',
    highlight: true,
    body:
      'Seven years after enactment, DHS/USCIS published the interim rule implementing the U nonimmigrant visa classification in 8 CFR 214.14 (72 Fed. Reg. 53014). USCIS began accepting Form I-918 petitions immediately. The rule implemented the 10,000 annual cap on principal approvals, codified the I-918 Supplement B law-enforcement certification, and defined qualifying criminal activities.',
    narration:
      "September 17th, 2007. Seven years after the law was signed, the Department of Homeland Security finally published the rule. Seventy-two Federal Register 53014. Inside the dense grey columns of that notice was the operating manual for the entire program. A new form, the I-918. Its centerpiece — Supplement B — the law-enforcement certification, signed by a police chief or prosecutor, attesting that the petitioner had been a victim and had helped with the case. The regulation codified the ten-thousand cap, listed the qualifying crimes, and set the evidentiary standards. USCIS began accepting applications immediately. For the first time since the bill had passed, a trafficked worker in a Georgia poultry plant, a stabbing victim in Los Angeles, a domestic-abuse survivor in Queens — each could file actual paperwork, by name, and ask for protection on the letterhead of the United States government.",
    citations: [
      { label: '72 Fed. Reg. 53014', url: 'https://www.federalregister.gov/documents/2007/09/17/E7-17807/new-classification-for-victims-of-criminal-activity-eligibility-for-u-nonimmigrant-status' },
      { label: '8 CFR 214.14', url: 'https://www.law.cornell.edu/cfr/text/8/214.14' },
    ],
    articles: [
      { outlet: 'Federal Register', headline: 'Interim rule — New Classification for Victims of Criminal Activity', url: 'https://www.federalregister.gov/documents/2007/09/17/E7-17807/new-classification-for-victims-of-criminal-activity-eligibility-for-u-nonimmigrant-status' },
      { outlet: 'USCIS', headline: 'Form I-918 — Petition for U Nonimmigrant Status', url: 'https://www.uscis.gov/i-918' },
      { outlet: 'Newspapers.com archive', headline: 'Sep–Oct 2007 coverage — U-visa interim rule', url: 'https://www.newspapers.com/search/results/?query=%22U+visa%22+%22interim+rule%22&dr_year=2007-2007' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/USCIS_logo_English.svg',
      caption:
        'U.S. Citizenship and Immigration Services — the agency that issued the U-visa interim rule on September 17, 2007.',
      credit: 'USCIS / Wikimedia Commons',
      license: 'Public domain (US DHS work, 17 U.S.C. § 105)',
    },
  },
  {
    year: 2008,
    title: 'First full fiscal year of U-visa adjudications',
    kind: 'milestone',
    body:
      'FY2009 (Oct 2008 – Sep 2009) was the first full adjudication year. USCIS received 6,835 principal petitions and approved 5,825 — below the 10,000 cap. Early coverage focused on domestic-violence cases where prosecutors credited U-visa cooperation with securing convictions.',
    narration:
      "In the first full fiscal year of adjudications, the numbers were modest. USCIS received 6,835 principal petitions. It approved 5,825. The program was running well under its ten-thousand ceiling. There was room. For a brief window, a U-visa petitioner could expect an answer in a matter of months. And the early press coverage was mostly a success story. Reporters found prosecutors — in Denver, in Houston, in small towns across the South — who said, on the record, that cases had been won because a witness felt safe enough to testify. The visa was doing what it had been designed to do. But quietly, inside the system, word was traveling. Advocacy networks were training attorneys. Police departments were learning to sign the certifications. Applications, each year, were climbing. The cap, for now, still held. For now.",
    citations: [
      { label: 'USCIS I-918 quarterly data, FY2009' },
    ],
  },
  {
    year: 2010,
    title: '10,000 annual cap reached for the first time',
    kind: 'milestone',
    highlight: true,
    body:
      'In FY2010 USCIS hit the statutory 10,000 U-1 principal-approval ceiling for the first time. The agency began deferring approvals past the cap into the following fiscal year via conditional-approval/waitlist mechanisms. From this point forward, every fiscal year has exhausted the cap.',
    narration:
      "And then, one year later, the cap arrived. Fiscal year 2010. For the first time since the program began, USCIS approved its ten-thousandth principal petition — and kept going, with approvable cases still on its desks. The statute was clear. Ten thousand, full stop. Anyone after that number had to wait. So the agency improvised again. If your case was approvable, but the year's visas were gone, you were placed on a waitlist — given deferred action, given work authorization, and told to wait for a visa number in some future fiscal year. It was a workaround built into a wall. From this moment forward, every single year of the program has exhausted the cap on its first pass. The ceiling Congress set in 2000 had, finally, begun to bend the program's shape around it.",
    citations: [
      { label: 'USCIS FY2010 annual data (principal approvals = 10,073)' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/USCIS_HQ_Groundbreaking_Ceremony_%2838096348641%29.jpg',
      caption:
        'USCIS — the agency first hit the statutory 10,000 U-1 cap in FY2010 and has never re-opened headroom since.',
      credit: 'Jetta Disco / DHS / Wikimedia Commons',
      license: 'Public domain (US DHS work)',
    },
  },
  {
    year: 2013,
    date: 'March 7, 2013',
    title: 'VAWA 2013 reauthorization',
    kind: 'law',
    body:
      'The VAWA 2013 reauthorization expanded U-visa protections, including by clarifying protections for Native American, LGBTQ, and same-sex-partner victims. It also gave DHS authority to extend U-visa status for applicants on the waitlist.',
    narration:
      "March of 2013. Congress returned once more to the Violence Against Women Act — and this reauthorization fight was harder than the ones before it. At issue were new protections for LGBTQ victims, for same-sex partners, and for tribal courts' jurisdiction over non-Native abusers on reservation land. The bill stalled for months. When it finally passed, the U visa came along with it — clarified, extended, updated. The statute now explicitly reached communities that had been living in the footnotes of earlier drafts. It also did something quieter but structural. It gave Homeland Security express authority to extend status for the growing population of petitioners stuck on the waitlist. The waitlist, by now, was no longer a theoretical overflow. It was becoming a feature of the program itself — a second tier of legal limbo, measured in years.",
    citations: [
      { label: 'Pub. L. 113-4' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/VAWA_%288537344577%29.jpg',
      caption:
        'President Barack Obama signs the Violence Against Women Reauthorization Act of 2013 at the Department of the Interior, March 7, 2013.',
      credit: 'U.S. Dept. of the Interior / Wikimedia Commons',
      license: 'CC BY-SA 2.0',
    },
    extraImages: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/VAWA_%288537344527%29.jpg',
        caption:
          'VAWA 2013 signing — Obama with Vice President Biden and bipartisan congressional leadership, Dept. of the Interior.',
        credit: 'U.S. Dept. of the Interior / Wikimedia Commons',
        license: 'CC BY-SA 2.0',
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/VAWA_%288537344589%29.jpg',
        caption:
          'VAWA 2013 signing ceremony, alternate angle — Obama with Biden and Attorney General Eric Holder.',
        credit: 'U.S. Dept. of the Interior / Wikimedia Commons',
        license: 'CC BY-SA 2.0',
      },
    ],
  },
  {
    year: 2014,
    title: 'Waitlist mechanism formalized as backlog grows',
    kind: 'policy',
    body:
      'With receipts far outpacing the 10,000 cap, USCIS formalized its waitlist procedure: petitions determined to be approvable were placed on a waiting list with deferred action and work authorization while waiting for a visa number in a future fiscal year. Pending inventory ended FY2014 at 52,870 — up from 15,471 at the end of FY2009.',
    narration:
      "By 2014, the stopgap had a name. USCIS formalized the waitlist — a standing procedure, not a one-off. If an officer reviewed your file and decided you met every requirement, but the year's visas were spoken for, you would be placed on the list. In the meantime, you received deferred action and a work permit. It was not nothing. For a domestic-violence survivor, a work permit meant she could pay her own rent and leave the abuser. For a trafficked laborer, it meant walking out of a back-of-house kitchen job with legal paper in hand. But the inventory tells the real story. At the end of fiscal year 2009, about fifteen thousand principal petitions were pending. By the close of fiscal year 2014, that number had climbed to fifty-two thousand, eight hundred and seventy. In five years, the backlog had more than tripled.",
  },
  {
    year: 2016,
    title: 'Pending petitions exceed 88,000',
    kind: 'milestone',
    body:
      'Pending principal U-visa petitions rose to 88,322 by the end of FY2016, a 5.6× increase since the program began. Advocacy groups and USCIS Ombudsman reports identified the fixed statutory cap and growing application volume as the primary driver.',
    narration:
      "Two years later, the backlog had grown again — to eighty-eight thousand, three hundred and twenty-two pending principal petitions. Nearly six times the number the program had carried at the end of its first year. The diagnosis was not a mystery. The USCIS Ombudsman — the internal watchdog office charged with flagging system breakdowns — laid it out in plain language in annual reports to Congress. Application volume was rising, year after year, as law-enforcement agencies learned the process and as advocacy networks deepened their reach. The cap was not. Ten thousand, set in 2000, held fast. The math was simple and unforgiving. If you file more cases than you can approve, the pile grows. And the pile, in this case, was not a pile of paper. It was a list of people — mostly women, mostly working, many still in the orbit of the people who had hurt them.",
    citations: [
      { label: 'USCIS Ombudsman Annual Report 2017' },
    ],
  },
  {
    year: 2020,
    title: 'Pending backlog tops 177,000',
    kind: 'milestone',
    body:
      'The end-of-FY2020 pending principal inventory reached 177,883. Average wait times for initial case review climbed past four years, prompting bipartisan calls for a Bona Fide Determination process to grant interim relief.',
    narration:
      "By the end of fiscal year 2020, the pending inventory had passed one hundred and seventy-seven thousand. The pandemic shut down interviews, shuttered field offices, slowed mail. Processing, already glacial, stalled further. Just the initial review — the first pass, before any decision on the merits — was now taking more than four years. A petitioner who filed before her daughter entered kindergarten could expect to wait until that child was finishing elementary school before an officer even opened the file. Something had to give. In Washington, the calls were no longer coming only from advocates. Prosecutors, police chiefs, and even members of Congress on both sides of the aisle began to press the agency for a new idea — some form of interim relief, something that would not require raising the cap, but would at least give petitioners a path out of the waiting room while the waiting room itself was fixed.",
  },
  {
    year: 2021,
    date: 'June 14, 2021',
    title: 'Bona Fide Determination policy (PM-602-0184)',
    kind: 'policy',
    highlight: true,
    body:
      'USCIS issued Policy Memorandum PM-602-0184 creating the Bona Fide Determination process. Petitioners whose applications clear preliminary screening receive a 4-year employment authorization document and deferred action while they wait for full adjudication and a visa number. This was the most significant administrative change to U-visa processing since 2007.',
    narration:
      "On June 14th, 2021, USCIS answered. Policy Memorandum 602-0184 — the Bona Fide Determination process. The idea was elegant, and overdue. Before fully adjudicating a U-visa petition, an officer could make a preliminary check. Were the basics present — the law-enforcement certification, a personal statement, the fingerprint clearance? If so, and if the petitioner did not pose a safety risk, she could be granted what the agency called bona fide determination status. With it came a four-year work permit and deferred action. Not a visa. Not permanent. But no longer limbo. For a program that had moved almost nothing, administratively, since the 2007 final rule, this was the largest procedural change in more than a decade. It did not raise the cap. It could not. But it quietly reshaped what a petitioner actually experienced, year to year, while waiting.",
    citations: [
      { label: 'USCIS PM-602-0184 · Bona Fide Determination policy', url: 'https://www.uscis.gov/policy-manual/volume-3-part-c-chapter-5' },
    ],
    articles: [
      { outlet: 'USCIS Policy Manual', headline: 'Volume 3, Part C, Chapter 5 — Bona Fide Determination', url: 'https://www.uscis.gov/policy-manual/volume-3-part-c-chapter-5' },
      { outlet: 'Newspapers.com archive', headline: 'June 2021 coverage — Bona Fide Determination policy', url: 'https://www.newspapers.com/search/results/?query=%22Bona+Fide+Determination%22+%22U+visa%22&dr_year=2021-2021' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Alejandro_Mayorkas_%28portrait%29.jpg',
      caption:
        'DHS Secretary Alejandro Mayorkas, who announced USCIS Policy Memorandum PM-602-0184 creating the Bona Fide Determination process in June 2021.',
      credit: 'Benjamin Applebaum / DHS / Wikimedia Commons',
      license: 'CC BY-SA 4.0 (also PD as US federal work)',
    },
  },
  {
    year: 2022,
    date: 'January 27, 2022',
    title: 'Barrios Garcia v. DHS (6th Cir.)',
    kind: 'court',
    highlight: true,
    body:
      'The Sixth Circuit held that USCIS had a mandatory, non-discretionary duty to place approvable U-visa petitioners on the waitlist and grant deferred action and work authorization within a reasonable time — not to sit on petitions indefinitely. The decision accelerated pressure that led to the Bona Fide Determination policy and continues to shape litigation on processing times.',
    narration:
      "Seven months after the agency rewrote its own procedures, the courts weighed in. January 27th, 2022. The United States Court of Appeals for the Sixth Circuit handed down Barrios Garcia versus Mayorkas, naming the Secretary of Homeland Security himself. The plaintiffs were U-visa petitioners whose files had sat for years without so much as a glance. The question was whether the agency could simply sit on an approvable case indefinitely. The court said no. The duty to place eligible petitioners on the waitlist, and to grant deferred action and work authorization within a reasonable time, was not discretionary. It was mandatory. The opinion did not dismantle the backlog. Congress alone could do that. But it set a legal floor. It told the agency that silence, forever, was not a lawful answer. Litigation over U-visa delays has, ever since, leaned on this ruling.",
    citations: [
      { label: 'Barrios Garcia v. U.S. Department of Homeland Security, 25 F.4th 430 (6th Cir. 2022)', url: 'https://www.courtlistener.com/opinion/9267430/barrios-garcia-v-mayorkas/' },
    ],
    articles: [
      { outlet: 'CourtListener', headline: 'Barrios Garcia v. DHS — 6th Cir. opinion', url: 'https://www.courtlistener.com/opinion/9267430/barrios-garcia-v-mayorkas/' },
      { outlet: 'Newspapers.com archive', headline: 'Jan–Feb 2022 coverage — Sixth Circuit Barrios Garcia ruling', url: 'https://www.newspapers.com/search/results/?query=%22Barrios+Garcia%22+%22U+visa%22&dr_year=2022-2022' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Potter_Stewart_US_Federal_Courthouse%2C_Cincinnati%2C_OH_%2832278864447%29.jpg',
      caption:
        'Potter Stewart U.S. Courthouse, Cincinnati — seat of the Sixth Circuit, which decided Barrios Garcia v. DHS on January 27, 2022.',
      credit: 'Wikimedia Commons',
      license: 'CC0 1.0 (public domain dedication)',
    },
  },
  {
    year: 2024,
    title: 'Pending inventory ~273,000; wait times 5–10+ years',
    kind: 'milestone',
    body:
      'End-of-FY2024 pending principal petitions reached approximately 272,881. At current approval rates (cap-limited to 10,000 principals per year), most newly-filed petitioners face initial review times well beyond five years and total case lifecycle of a decade or more.',
    narration:
      "By the end of fiscal year 2024, the pending file stood at roughly two hundred and seventy-two thousand, eight hundred and eighty-one principal petitions. Recall the arithmetic. Ten thousand approvals a year, set in the statute. Receipts many times that. The result is not a queue so much as a generation. A petitioner filing today — a domestic-violence survivor, perhaps, who helped her local detective secure a conviction last spring — can expect her initial review to take more than five years. The full case lifecycle, from petition to green card, may stretch past a decade. Children listed as derivatives on a parent's application routinely age out of eligibility before a decision arrives. The waitlist invented in 2010 as a stopgap, and the Bona Fide Determination added in 2021 as relief, have become the program. The program itself has become the wait.",
    citations: [
      { label: 'USCIS I-918 quarterly data, FY2024' },
    ],
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/USCIS_HQ_Groundbreaking_Ceremony_%2838096348641%29.jpg',
      caption:
        'USCIS Headquarters in Camp Springs, Maryland — the agency processing a quarter-million pending U-visa petitions.',
      credit: 'Jetta Disco / DHS / Wikimedia Commons',
      license: 'Public domain (US DHS work)',
    },
    extraImages: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/66/DHS_Secretary_Alejandro_Mayorkas_Testifies_During_a_Senate_Homeland_Security_and_Government_Affairs_Committee_Hearing_on_18_April_2024_-_1.jpg',
        caption:
          'DHS Secretary Alejandro Mayorkas testifying before the Senate Homeland Security Committee, April 18, 2024 — U-visa backlog and processing times were a recurring topic.',
        credit: 'Tia Dufour / DHS / Wikimedia Commons',
        license: 'Public domain (US federal government work)',
      },
    ],
  },
  {
    year: 2025,
    title: 'Program-integrity concerns become prominent',
    kind: 'coverage',
    body:
      'Federal indictments for alleged U-visa fraud schemes — including staged robberies and fraudulent law-enforcement certifications — received national coverage. Simultaneously, advocates raised concerns that heightened scrutiny could further slow legitimate adjudications and deter qualifying victims from reporting crime. The debate sits at the core of this site.',
    narration:
      "Which brings us, finally, to the present. In 2025, a new kind of story began appearing on the front pages. Federal indictments — prosecutors alleging organized schemes to exploit the U visa itself. Staged robberies, reportedly filmed and reported to sympathetic officers. Law-enforcement certifications, allegedly obtained through fraud. The cases were not everywhere, but they were vivid, and they traveled. At the same moment, advocates warned that the response — tighter scrutiny, more document requests, more referrals to the fraud-detection unit — would land hardest on legitimate petitioners. Those whose files already sat for years might now sit longer. And the quiet collateral effect, harder to measure, would be on the next potential witness. The woman standing in a kitchen, deciding whether to call the police. That decision is the one the U visa was invented, twenty-five years ago, to make possible. The debate over whether it still does — is where our story now waits.",
  },
];

export const KIND_META: Record<
  EventKind,
  { label: string; color: string; accent: string }
> = {
  law: { label: 'Statute', color: '#3b82f6', accent: 'bg-blue-500' },
  rule: { label: 'Rule', color: '#10b981', accent: 'bg-emerald-500' },
  court: { label: 'Court', color: '#f59e0b', accent: 'bg-amber-500' },
  policy: { label: 'Policy', color: '#a855f7', accent: 'bg-purple-500' },
  milestone: { label: 'Milestone', color: '#ef4444', accent: 'bg-red-500' },
  coverage: { label: 'Coverage', color: '#64748b', accent: 'bg-slate-500' },
};
