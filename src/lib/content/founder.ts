// Founder bio — single source of truth for the "Why I Built AlumniUp" section.
//
// Keeping this in one constants file lets the owner review and approve the
// wording (especially the career sentence) without touching the component
// markup in src/app/page.tsx.

export const FOUNDER = {
  name: "Risha Alexis",
  schoolFullName: "Martin Luther King Jr. Senior High School",
  schoolShortName: "King High",

  // Owner-editable: how Risha's career is described. Change this sentence to
  // adjust the founder's professional framing.
  careerSentence: "build a career in engineering and cybersecurity",

  // Owner-editable: the closing call-to-action line.
  closingLine: "Your alma mater needs you. Again.",
} as const;
