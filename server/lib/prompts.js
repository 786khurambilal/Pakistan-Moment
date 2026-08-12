// Scene presets, quiz definitions, and prompt builders for Pakistan Times.
// These power both the Gemini image generation (scene) and the newspaper article (story).

/**
 * Historical scenes. Each places the user at the CENTER of a founders' group photo.
 * `leaders` names are woven into the image prompt so the model renders recognizable figures.
 */
export const SCENES = [
  {
    id: 'resolution-1940',
    title: 'The Pakistan Resolution',
    era: 'Lahore, 23 March 1940',
    blurb: 'Stand with the leaders as the demand for Pakistan is declared.',
    backdrop:
      'a grand outdoor session of the All-India Muslim League at Minto Park, Lahore, with a large crowd, period tents and banners, the ground where Minar-e-Pakistan would later rise',
    leaders: [
      { name: 'Muhammad Ali Jinnah (Quaid-e-Azam)', refKey: 'jinnah' },
      { name: 'Allama Muhammad Iqbal', refKey: 'iqbal' },
      { name: 'Liaquat Ali Khan', refKey: 'liaquat' },
    ],
    attire: 'formal 1940s attire — sherwani, karakul (Jinnah) cap, waistcoats and long coats',
    grade: 'black-and-white documentary photograph, fine film grain, soft flashbulb lighting',
  },
  {
    id: 'independence-1947',
    title: 'Independence Dawn',
    era: 'Karachi, 14 August 1947',
    blurb: 'Be there the moment a nation is born, under the new flag.',
    backdrop:
      'the flag-raising of the new Dominion of Pakistan in Karachi, the green-and-white crescent flag being hoisted, jubilant crowds, government building steps',
    leaders: [
      { name: 'Muhammad Ali Jinnah (Quaid-e-Azam)', refKey: 'jinnah' },
      { name: 'Fatima Jinnah (Madar-e-Millat)', refKey: 'fatima' },
    ],
    attire: 'crisp 1947 formal wear — sherwani and cap, elegant sari/shalwar for Ms. Jinnah',
    grade: 'warm sepia-toned vintage photograph, gentle vignetting, subtle grain',
  },
  {
    id: 'ziarat-1948',
    title: 'With the Quaid at Ziarat',
    era: 'Ziarat Residency, 1948',
    blurb: 'A quiet, dignified portrait beside the Father of the Nation.',
    backdrop:
      'the wooden veranda of the Ziarat Residency in the mountains of Balochistan, pine trees, crisp daylight, a calm and dignified mood',
    leaders: [{ name: 'Muhammad Ali Jinnah (Quaid-e-Azam)', refKey: 'jinnah' }],
    attire: 'dignified late-1940s attire — sherwani, shawl, formal cap',
    grade: 'high-contrast black-and-white portrait photograph, classic 1940s studio tonality',
  },
  {
    id: 'founders-portrait',
    title: "The Founders' Portrait",
    era: 'Official Studio Sitting, 1947',
    blurb: 'A formal standing portrait among the founding leaders of Pakistan.',
    backdrop:
      'a formal photographic studio of the 1940s with a painted canvas backdrop and a Persian rug, ' +
      'the group STANDING shoulder to shoulder in a row, warm tungsten portrait lighting',
    leaders: [
      { name: 'Muhammad Ali Jinnah (Quaid-e-Azam)', refKey: 'jinnah' },
      { name: 'Liaquat Ali Khan', refKey: 'liaquat' },
      { name: 'Fatima Jinnah (Madar-e-Millat)', refKey: 'fatima' },
    ],
    attire: 'formal ceremonial 1940s dress — sherwanis, caps, elegant traditional wear',
    grade: 'formal sepia studio portrait, sharp focus, timeless 1940s photographic look',
  },
  {
    id: 'round-table-1931',
    title: 'The Round Table Conference',
    era: 'London, 1931',
    blurb: 'Negotiate the subcontinent’s future on the world stage.',
    backdrop:
      'a grand wood-panelled conference hall in London, a long polished table, delegates in suits and traditional dress, tall windows and chandeliers',
    leaders: [{ name: 'Muhammad Ali Jinnah (Quaid-e-Azam)', refKey: 'jinnah' }],
    attire: 'early-1930s formal wear — three-piece suits, sherwani and karakul cap',
    grade: 'black-and-white press photograph of the 1930s, slightly soft, archival grain',
  },
];

export function getScene(id) {
  return SCENES.find((s) => s.id === id) || SCENES[0];
}

/**
 * The playful quiz. Answers feed the newspaper article generator.
 * `type`: 'choice' shows options; 'text' is free input.
 */
export const QUIZ = [
  {
    id: 'name',
    type: 'text',
    label: 'What shall history call you?',
    hint: 'Your name — it goes on the front page.',
    placeholder: 'e.g. Ayesha Khan',
    required: true,
  },
  {
    id: 'role',
    type: 'choice',
    label: 'Your role in the freedom movement?',
    options: ['Fiery Orator', 'Master Strategist', 'Fearless Journalist', 'Tireless Organizer', 'Revolutionary Poet'],
  },
  {
    id: 'gender',
    type: 'select',
    label: 'Which pronouns should the story use?',
    hint: 'This helps the newspaper avoid he/she grammar mistakes.',
    placeholder: 'Select pronouns',
    options: ['Female (she/her)', 'Male (he/him)', 'Neutral (they/them)'],
    required: true,
  },
  {
    id: 'alterEgo',
    type: 'text',
    label: 'If you weren’t at Arvo, you’d be a…',
    hint: 'Dream job, alternate life — go wild.',
    placeholder: 'e.g. a mountaineer / a chai entrepreneur',
    required: true,
  },
  {
    id: 'starForm',
    type: 'choice',
    label: "What's your greatest strength?",
    options: ['Determination — I never give up', 'Communication — I can convince anyone', 'Big Thinking — I see the bigger picture', 'Calm Under Pressure — I stay steady when it gets tough', 'Positivity — I lift everyone around me'],
  },
  {
    id: 'cause',
    type: 'text',
    label: 'The one cause you’d fight hardest for?',
    hint: 'Justice, education, unity… your call.',
    placeholder: 'e.g. education for every child',
    required: true,
  },
];

const QUAID_E_AZAM = 'Muhammad Ali Jinnah (Quaid-e-Azam)';

const QUAID_DESCRIPTION =
  'QUAID-E-AZAM IDENTITY: Render Muhammad Ali Jinnah accurately. If Image 2 is provided, use Image 2 ' +
  'as the exact face reference for Quaid-e-Azam. Preserve his facial anatomy: long slim angular face, ' +
  'high cheekbones, narrow jaw, sharp aquiline nose, deep-set serious eyes, thin lips, clean-shaven, ' +
  'prominent ears, older age and black karakul/Jinnah cap. ' +
  'He is an elderly South Asian Muslim statesman, not European or Caucasian: very slim angular face, ' +
  'high cheekbones, narrow jaw, sharp aquiline nose, deep-set serious eyes, thin lips, clean-shaven, ' +
  'wearing a black karakul/Jinnah cap and dark sherwani. Do not make him young, bald, broad-faced, ' +
  'fair European-looking, or generic.';

const IDENTITY_LOCK =
  'IDENTITY LOCK: Image 1 is the guest selfie. Keep the same face, age, eyes, nose, lips, beard, ' +
  'hairline, skin tone and texture. Do not beautify, age, smooth, reshape, or blend this face with ' +
  'Quaid-e-Azam. Do not add a cap, turban, crown, decorative hat or new headwear to the guest unless ' +
  'it exists in Image 1. Change only clothing, lighting and vintage photo style.';

/**
 * Build the image-generation prompt for a scene.
 * Since WaveSpeed handles face-swapping as a post-processing step, the scene prompt
 * only needs to produce a realistic vintage photograph with a person at center.
 * Face accuracy is NOT required here — just a natural-looking placeholder person.
 */
export function buildScenePrompt(scene, attachedLeaders = [], unattachedNames = []) {
  const leaderNames = [
    ...attachedLeaders.map((leader) => leader.name),
    ...unattachedNames,
  ];
  const prominentPeople = 1 + leaderNames.length;

  // Build image legend — only leader references, no guest image
  const legend = [];
  attachedLeaders.forEach((leader, index) => {
    const imageNumber = index + 1;
    const isQuaid = leader.refKey === 'jinnah' || leader.name === QUAID_E_AZAM;
    legend.push(
      `Image ${imageNumber} = reference photo of ${leader.name}.${isQuaid ? ' He wears a black karakul cap and dark sherwani.' : ''}`
    );
  });

  const lines = [
    `Generate a single photorealistic vintage group photograph set in ${scene.era}.`,
    ``,
    `SCENE: ${scene.backdrop}.`,
    `STYLE: ${scene.grade}.`,
    ``,
    attachedLeaders.length
      ? `REFERENCE IMAGES (${attachedLeaders.length} total, provided after this text):`
      : `No reference images provided.`,
    ...legend.map((l) => `  ${l}`),
    ``,
    `COMPOSITION:`,
    `- Total foreground people: ${prominentPeople} (a GUEST at center + ${leaderNames.length ? leaderNames.join(', ') : 'historical figures'}).`,
    `- Place a YOUNG SOUTH ASIAN PERSON at the CENTER-FRONT as the guest of honour. This person should:`,
    `  - Be clearly distinct from the historical leaders (younger, modern-looking face)`,
    `  - Have a neutral, pleasant expression`,
    `  - Be shown from chest/waist up, slightly forward of the others`,
    `  - Wear simple dark 1940s formal attire (sherwani or coat), NO headwear/cap`,
    `  - Have a CLEARLY VISIBLE, UNOBSTRUCTED face (no shadows hiding features, no turned head)`,
    `- The guest must be the LARGEST and most prominent face in the image.`,
    `- Place historical leaders beside and slightly behind the guest at natural scale.`,
    `- Leaders should have SMALLER faces than the guest (further back, slightly to the side).`,
    `- Everyone must share the same lighting, camera angle, film grain, and depth of field.`,
    ``,
    `HISTORICAL FIGURES:`,
    leaderNames.length
      ? `- Include: ${leaderNames.join(', ')}.`
      : `- Include appropriate 1940s Pakistani leaders.`,
    attachedLeaders.some((l) => l.refKey === 'jinnah')
      ? `- Quaid-e-Azam: elderly South Asian man, slim angular face, high cheekbones, sharp aquiline nose, thin lips, serious expression, black karakul cap, dark sherwani. Match his face to his reference image.`
      : `- Quaid-e-Azam (if included): elderly South Asian man, slim angular face, karakul cap, dark sherwani.`,
    ``,
    `CRITICAL:`,
    `- The center guest must have the LARGEST face in the photo (closest to camera).`,
    `- Do NOT make the guest look like any historical leader.`,
    `- The guest is a DIFFERENT person from all historical figures — younger, modern face.`,
    ``,
    `OUTPUT: One photograph only. No text, borders, watermarks, or captions.`,
  ];

  return lines.join('\n');
}

/** Second-pass prompt: lock the central face back to the original selfie. */
export function buildRefinePrompt() {
  return [
    'FACE SWAP OPERATION:',
    '',
    'You have been given:',
    '1. The REAL face photo (shown first and last)',
    '2. A generated group photograph (shown in between)',
    '',
    'Your task: Replace the face of the CENTER-FRONT person in the group photo with the REAL face.',
    '',
    'Rules:',
    '- TRANSPLANT the real face onto the center person. Do not reinterpret or reimagine it.',
    '- Match EXACTLY: face shape, forehead, eyebrows, eyes (shape, size, spacing, color), nose (bridge, tip, width, nostrils), mouth (lip shape, thickness), chin, jawline, cheekbones, ears, skin color, skin texture, facial hair, hairline, wrinkles, moles, scars, asymmetry.',
    '- Keep the head at the same angle/pose as in the group photo.',
    '- Apply only the scene\'s lighting and film grain to the face — no other changes.',
    '- Do NOT change: background, other people, clothing, body, composition.',
    '- Do NOT: smooth skin, remove blemishes, change skin tone, reshape anything, beautify.',
    '- The result should look like THIS specific person was photographed in that scene.',
    '',
    'Output the corrected photograph only.',
  ].join('\n');
}

/** Build the newspaper-article generation prompt. Returns a strict JSON contract. */
export function buildStoryPrompt(answers, scene) {
  const a = answers || {};
  const name = (a.name || 'A Visionary Soul').toString().trim();
  const pronouns = getPronouns(a.gender);
  return [
    'You are the star feature-writer of "PAKISTAN TIMES", a patriotic Pakistani newspaper dated 14 August 1947.',
    'Write a warm, witty, and inspiring front-page story that imagines the following modern person as a hero of the Pakistan freedom movement.',
    '',
    'Person details:',
    `- Name: ${name}`,
    `- Gender/pronouns: ${a.gender || 'Neutral (they/them)'}`,
    `- Use these exact pronoun forms for this person: subject=${pronouns.subject}, object=${pronouns.object}, possessive adjective=${pronouns.possessiveAdjective}, possessive pronoun=${pronouns.possessivePronoun}.`,
    `- Their role in the movement: ${a.role || 'a devoted patriot'}`,
    `- In real life, away from the struggle, they would be: ${a.alterEgo || 'a person of many talents'}`,
    `- Their defining inner power ("star form"): ${a.starForm || 'unshakeable resolve'}`,
    `- The cause they fight hardest for: ${a.cause || 'freedom and dignity'}`,
    `- The historical scene they appear in: ${scene.title} (${scene.era}).`,
    '',
    'Guidelines:',
    '- Voice: 1940s newspaper prose, dignified but playful, celebratory, never mocking. Reference the era and the founders naturally.',
    '- Do not guess pronouns from the name. Use the exact pronoun forms supplied above throughout the story.',
    '- Predict, in a fun and flattering way, the role this person plays in history and what they achieve for the nation.',
    '- Weave in their real-life alter-ego and their cause as charming period details.',
    '- Keep it tasteful and family-friendly. Avoid modern slang and real political controversy.',
    '- Invent ONE short, quotable line attributed to the person (a period-style quote).',
    '',
    'Respond with ONLY valid minified JSON (no markdown, no code fences) using EXACTLY this shape:',
    '{',
    '  "kicker": "short ALL-CAPS label, e.g. EXCLUSIVE / BREAKING",',
    '  "headline": "a bold 4-8 word front-page headline about this person",',
    '  "subhead": "a one-sentence deck under the headline",',
    '  "byline": "By Pakistan Times Correspondent",',
    '  "dateline": "short place + date, era-appropriate",',
    '  "body": ["paragraph 1", "paragraph 2", "paragraph 3"],',
    '  "pullQuote": "the invented quotable line, in the person\'s voice",',
    '  "prediction": "one punchy sentence: what history will remember them for"',
    '}',
    'Each body paragraph should be 2-4 sentences. Return 3 paragraphs.',
  ].join('\n');
}

function getPronouns(gender) {
  const value = (gender || '').toString().toLowerCase();
  if (value.includes('female') || value.includes('she')) {
    return {
      subject: 'she',
      object: 'her',
      possessiveAdjective: 'her',
      possessivePronoun: 'hers',
    };
  }
  if (value.includes('male') || value.includes('he/him')) {
    return {
      subject: 'he',
      object: 'him',
      possessiveAdjective: 'his',
      possessivePronoun: 'his',
    };
  }
  return {
    subject: 'they',
    object: 'them',
    possessiveAdjective: 'their',
    possessivePronoun: 'theirs',
  };
}
