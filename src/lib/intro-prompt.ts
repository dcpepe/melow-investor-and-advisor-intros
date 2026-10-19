export const INTRO_PROMPT_SETTING_KEY = "introPrompt";

/**
 * Placeholders filled at render time so the prompt stays current as content changes:
 *   {{ICP_TITLES}}    -> the ICP titles as "- item" lines
 *   {{ACCOUNT_LISTS}} -> every published account list with its companies
 */
export const DEFAULT_INTRO_PROMPT_TEMPLATE = `I'm helping the founders of Melow find warm introductions into their target accounts.

ABOUT MELOW
Melow helps enterprise teams turn messy, fragmented data into a clean operating layer for reporting, automation, and AI workflows. It connects to the systems companies already use (ERPs, databases, spreadsheets, documents, BI tools) and proves results on the company's own data before they commit.

WHO THE RIGHT PEOPLE ARE
The most useful intros are to people with titles like:
{{ICP_TITLES}}

THE ACCOUNTS
{{ACCOUNT_LISTS}}

YOUR TASK
Search my network, including LinkedIn connections, email contacts, CRM, and portfolio founders and operators, and:
1. Find people I know at these companies (or who recently left them), prioritizing the titles above and anyone in data, AI, or transformation leadership.
2. For each match, give me: company, person's name, title, how I know them, and connection strength (strong / medium / weak).
3. Rank the results by likely intro quality, treating the account lists in the order given as the priority order.
4. For my top 5 matches, draft a short double-opt-in message I can send them asking if they'd like an intro to Melow's founders (Pepe and Alex).

Present everything as a table sorted by priority, with the draft messages below it.`;

type ListForPrompt = { title: string; description: string | null; accounts: { name: string }[] };

export function renderIntroPrompt(template: string, icpTitles: string[], lists: ListForPrompt[]): string {
  const icpBlock = icpTitles.map((t) => `- ${t}`).join("\n");
  const listsBlock = lists
    .filter((l) => l.accounts.length > 0)
    .map((l) => `### ${l.title}${l.description ? ` (${l.description})` : ""}\n${l.accounts.map((a) => a.name).join(", ")}`)
    .join("\n\n");
  return template.replaceAll("{{ICP_TITLES}}", icpBlock).replaceAll("{{ACCOUNT_LISTS}}", listsBlock);
}
