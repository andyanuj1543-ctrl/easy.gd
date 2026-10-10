import { GDTopic } from '../types/gd';

export const TOPIC_COLLECTION: GDTopic[] = [
  // --- N1: Economic Topics ---
  {
    id: 'ubi-india',
    title: 'Should India Adopt Universal Basic Income (UBI)?',
    category: 'Placement Classic',
    description: 'Would a guaranteed unconditional income eradicate poverty, or create severe fiscal deficits and labor disincentives?',
    keyPerspectives: [
      'Fiscal feasibility and tax-to-GDP ratio constraints',
      'Targeted welfare leakage vs unconditional cash direct-benefit transfer',
      'Impact on informal labor market participation',
      'Inflationary pressures on essential consumer goods'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'crypto-regulate-ban',
    title: 'Cryptocurrency: Regulate with Guardrails or Complete Ban?',
    category: 'Placement Classic',
    description: 'Does decentralized digital currency promote financial innovation and web3 jobs, or threaten monetary sovereignty and enable crime?',
    keyPerspectives: [
      'Central Bank Digital Currency (CBDC/e-Rupee) vs private tokens',
      'Capital flight, money laundering, and tax evasion risks',
      'Technological innovation in blockchain, smart contracts, and fintech',
      'Retail investor protection during volatile speculative cycles'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'gig-economy',
    title: 'Is the Gig Economy Sustainable for Indian Youth?',
    category: 'Placement Classic',
    description: 'Delivery and platform work provides instant livelihoods for millions, but lacks social security, minimum wage guarantees, and career growth.',
    keyPerspectives: [
      'Flexible employment generation vs algorithmic exploitation',
      'Need for statutory social security, health cover, and pension safety nets',
      'Platform unit economics and platform gig fees',
      'Long-term skill stagnation of young graduates'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'privatize-psu-banks',
    title: 'Should India Privatize Public Sector Banks?',
    category: 'Placement Classic',
    description: 'Do private banks deliver superior governance and capital efficiency, or are public sector banks vital for priority sector lending and rural inclusion?',
    keyPerspectives: [
      'Non-Performing Assets (NPAs) and taxpayer-funded recapitalization cycles',
      'Jan Dhan accounts, rural branch presence, and priority sector mandates',
      'Competition, technological agility, and customer service standards',
      'Sovereign trust vs systemic private bank failure precedents'
    ],
    suggestedDurationMins: 6
  },

  // --- N4: Technological Topics ---
  {
    id: 'ai-jobs-threat',
    title: 'Is AI a Genuine Threat to White-Collar Jobs or a Productivity Multiplier?',
    category: 'Tech & AI',
    description: 'Generative AI can write code, draft legal contracts, and generate designs. Will it displace campus graduates or elevate them into prompt strategists?',
    keyPerspectives: [
      'Entry-level junior developer and QA role compression',
      'Augmentative productivity and 10x developer leverage',
      'Retraining bottlenecks and academic curriculum lag',
      'New job categories: AI safety, prompt architects, synthetic data engineers'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'data-privacy-myth',
    title: 'Is Digital Privacy an Illusion in the Age of Big Tech?',
    category: 'Tech & AI',
    description: 'In an era of targeted ad networks, social telemetry, and biometric surveillance, can regulatory frameworks like DPDP genuinely protect citizens?',
    keyPerspectives: [
      'Convenience-for-data trade-off in free digital services',
      'The Digital Personal Data Protection (DPDP) Act implementation',
      'Cross-border surveillance and algorithmic behavioral nudges',
      'End-to-end encryption and decentralized identity models'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'social-media-minors',
    title: 'Should Social Media be Banned for Minors Under 16?',
    category: 'Tech & AI',
    description: 'Following global policy debates, should governments restrict algorithmic algorithmic feeds and smartphone social apps for school children?',
    keyPerspectives: [
      'Adolescent mental health, attention span, and dopamine loops',
      'Digital literacy, social connection, and informational access',
      'Feasibility of age-verification without invasive digital surveillance',
      'Parental responsibility vs statutory platform regulation'
    ],
    suggestedDurationMins: 6
  },

  // --- N2 & N3: Political & Social Topics ---
  {
    id: 'reservation-private-sector',
    title: 'Is Affirmative Action / Reservation Justified in the Private Sector?',
    category: 'Controversial',
    description: 'With shrinking government jobs, should private companies have affirmative action quotas, or should meritocracy and market forces govern hiring?',
    keyPerspectives: [
      'Historical social disparities and diversity representation',
      'Meritocracy, global competitiveness, and talent mobility',
      'Private sector autonomy vs corporate social responsibility (CSR)',
      'Alternative affirmative models: skill-building, scholarships, mentoring'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'uniform-civil-code',
    title: 'Uniform Civil Code in India: National Integration or Cultural Threat?',
    category: 'Controversial',
    description: 'Does a common civil code ensure gender justice and secular equality, or does it infringe upon minority religious customs and federal diversity?',
    keyPerspectives: [
      'Gender justice and equal inheritance/marriage rights for women',
      'Pluralism, minority rights, and constitutional freedom of religion',
      'National integration vs fear of majoritarian imposition',
      'Gradual reform within personal laws vs single statutory code'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'voting-compulsory',
    title: 'Should Voting in Democratic Elections be Made Compulsory?',
    category: 'Controversial',
    description: 'Would mandatory voting strengthen democratic legitimacy and counter urban apathy, or violate personal liberty and freedom of expression?',
    keyPerspectives: [
      'Civic duty, high voter turnout, and electoral accountability',
      'The democratic right NOT to choose (freedom of conscience)',
      'Enforcement costs and legal penalties for non-voters',
      'NOTA effectiveness and genuine political engagement'
    ],
    suggestedDurationMins: 6
  },

  // --- N8: Case Studies ---
  {
    id: 'startup-burn-case',
    title: 'Case Study: Direct-to-Consumer Startup Facing 6-Month Cash Burn Crisis',
    category: 'Case Study',
    description: 'D2C brand QuickGlow has 6 months runway left in a venture winter. Founder advocates doubling ad spend for scale; CFO demands 40% headcount cuts.',
    keyPerspectives: [
      'Unit economics and Customer Acquisition Cost (CAC) vs Lifetime Value (LTV)',
      'Emergency runway preservation and hiring freeze vs team morale collapse',
      'Pivot from hyper-growth discounts to sustainable gross margin profitability',
      'Down-round valuation implications and bridge debt options'
    ],
    suggestedDurationMins: 8
  },
  {
    id: 'bank-npa-turnaround',
    title: 'Case Study: Turnaround Strategy for a High Non-Performing Asset (NPA) Bank',
    category: 'Case Study',
    description: 'A mid-sized commercial bank reports gross NPAs of 14% due to stressed infrastructure loans. Formulate a 2-year recovery roadmap.',
    keyPerspectives: [
      'Asset Reconstruction Companies (ARCs) and hair-cut negotiations',
      'Tightening credit underwriting with real-time financial telemetry',
      'Recovery via Insolvency and Bankruptcy Code (IBC) tribunals',
      'Retail loan diversification away from bulky corporate exposure'
    ],
    suggestedDurationMins: 8
  },

  // --- N7: Abstract Topics ---
  {
    id: 'red-danger-passion',
    title: 'Abstract: Red is the Colour of Danger',
    category: 'Abstract',
    description: 'A classic lateral thinking placement topic testing ability to structure non-obvious ideas, symbolism, and philosophical perspectives.',
    keyPerspectives: [
      'Dual symbolism: Warning and danger vs energy, revolution, and love',
      'Biological psychology: High wavelength visibility and survival instincts',
      'Socio-political context: Financial deficits (in the red) vs flags of liberation',
      'Metaphorical synthesis: Risk-taking as the essential prerequisite of breakthrough innovation'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'silence-louder-words',
    title: 'Abstract: Silence is Louder Than Words',
    category: 'Abstract',
    description: 'Evaluate the acoustic, interpersonal, political, and ethical dimensions of silence in modern human leadership.',
    keyPerspectives: [
      'Strategic silence in negotiation and leadership listening',
      'Complicity of silence in societal injustice ("the silence of good people")',
      'Mental clarity and mindfulness in an attention-economy noise cacophony',
      'Eloquent silence vs passive avoidance of accountability'
    ],
    suggestedDurationMins: 6
  },
  {
    id: 'pen-mightier-sword',
    title: 'Abstract: The Pen is Mightier Than the Sword in the Digital Age',
    category: 'Abstract',
    description: 'In an era of hypersonic weapons and cyber warfare, does the written word / digital narrative still shape human civilization more than physical force?',
    keyPerspectives: [
      'Information warfare, narrative engineering, and viral social memes',
      'Rule of law, constitutions, and diplomacy vs military deterrence',
      'Code as the modern pen: algorithms that govern global commerce and infrastructure',
      'The vulnerability of physical force without cultural ideological backing'
    ],
    suggestedDurationMins: 6
  }
];
