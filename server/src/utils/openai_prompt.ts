export function buildVoicePrompt(options: {
  title?: string;
  original: string;
  style?: string;
  voiceSample?: string | null;
}) {
  const { title = "", original, style = "", voiceSample = null } = options;
  let header = `Rewrite the following lesson content into a crisp, well-structured lesson suitable for software engineers. Preserve technical accuracy and any code examples. `;
  if (title) header += `Lesson title: "${title}". `;
  header += `${style}\n\n`;

  if (voiceSample) {
    header += `Mimic the instructional style and tone of the following short sample written by the instructor. Keep similar sentence length, phrase choices, and directness where appropriate:\n\n"${voiceSample}"\n\n`;
  } else {
    header += `The instructor is a seasoned CTO with a pragmatic, example-led teaching style: focus on clarity, short code-driven examples, and direct guidance.\n\n`;
  }

  header += `Guidelines:\n- Break the lesson into sections with headings (Overview, Concepts, Examples, Exercises, Summary).\n- Format code blocks as fenced triple-backtick blocks with language where possible.\n- Add bullet-point takeaways and a short 3-question quiz at the end (with answers hidden under "Answers").\n- Keep each sub-section concise (no more than ~300 words), but preserve key details.\n\nOriginal content below:\n\n`;

  const trimmedOriginal =
    original.length > 28000
      ? original.slice(0, 28000) + "\n\n[TRUNCATED]"
      : original;
  return header + trimmedOriginal;
}
