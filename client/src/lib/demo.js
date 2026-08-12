// Sample data for the #demo preview route — lets you eyeball the newspaper without an API key.
const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9b58a"/><stop offset="1" stop-color="#8a744c"/>
    </linearGradient>
  </defs>
  <rect width="640" height="800" fill="url(#g)"/>
  <g fill="#5c4a2c" opacity="0.85">
    <circle cx="150" cy="330" r="70"/><rect x="90" y="410" width="120" height="260" rx="30"/>
    <circle cx="320" cy="300" r="90"/><rect x="240" y="400" width="160" height="320" rx="36"/>
    <circle cx="500" cy="330" r="70"/><rect x="440" y="410" width="120" height="260" rx="30"/>
  </g>
  <text x="320" y="770" text-anchor="middle" font-family="Georgia" font-size="26" fill="#3a2f1c">SAMPLE — your photo appears here</text>
</svg>`);

export const DEMO = {
  answers: { name: 'Ayesha Khan', role: 'Fiery Orator', gender: 'Female (she/her)', alterEgo: 'a mountaineer', starForm: 'Boundless Vision', cause: 'education for every child' },
  scene: { id: 'independence-1947', title: 'Independence Dawn', era: 'Karachi, 14 August 1947' },
  result: {
    image: placeholder,
    story: {
      kicker: 'EXCLUSIVE',
      headline: 'A Voice That Woke A Nation',
      subhead: 'Ayesha Khan rallies thousands as the crescent flag rises over Karachi.',
      byline: 'By Pakistan Times Correspondent',
      dateline: 'Karachi, 14 August 1947',
      body: [
        'In the golden light of a new dawn, few names carry as far as that of Ayesha Khan, whose fiery oratory has this week electrified crowds from the harbour to the halls of power. Witnesses speak of a voice that does not merely ask for freedom, but insists upon it.',
        'Away from the podium, friends say she dreams of distant summits — a mountaineer at heart, forever climbing toward something higher. That same boundless vision, they note, is precisely what she now brings to the cause of a nation finding its feet.',
        'Above all, she is remembered for a single, tireless demand: education for every child. Should the founders’ dream take root, historians may well record that this daughter of the movement helped light the first lamp.',
      ],
      pullQuote: 'We do not wait for the dawn — we ring the bell that summons it.',
      prediction: 'Remembered as the orator whose words became a nation’s courage.',
    },
  },
};
