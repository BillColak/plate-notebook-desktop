// Note templates for common note types
// Each template returns Plate.js content structure

export interface NoteTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  content: () => unknown[];
}

function today(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export const templates: NoteTemplate[] = [
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    emoji: "📋",
    description: "Date, attendees, agenda, action items",
    content: () => [
      { type: "h1", children: [{ text: `Meeting Notes — ${today()}` }] },
      { type: "h2", children: [{ text: "Attendees" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Name 1" }] }],
          },
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Name 2" }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Agenda" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Topic 1" }] }],
          },
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Topic 2" }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Discussion" }] },
      { type: "p", children: [{ text: "" }] },
      { type: "h2", children: [{ text: "Action Items" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [
              { type: "lic", children: [{ text: "[ ] Action item 1" }] },
            ],
          },
          {
            type: "li",
            children: [
              { type: "lic", children: [{ text: "[ ] Action item 2" }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "journal-entry",
    name: "Journal Entry",
    emoji: "📔",
    description: "Date, mood, highlights, gratitude, reflection",
    content: () => [
      { type: "h1", children: [{ text: `Journal — ${today()}` }] },
      { type: "h2", children: [{ text: "Mood" }] },
      { type: "p", children: [{ text: "How am I feeling today? " }] },
      { type: "h2", children: [{ text: "Highlights" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Highlight 1" }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Gratitude" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [
              { type: "lic", children: [{ text: "I'm grateful for..." }] },
            ],
          },
        ],
      },
      { type: "h2", children: [{ text: "Reflection" }] },
      { type: "p", children: [{ text: "" }] },
    ],
  },
  {
    id: "project-plan",
    name: "Project Plan",
    emoji: "🎯",
    description: "Overview, goals, milestones, tasks, resources",
    content: () => [
      { type: "h1", children: [{ text: "Project Plan" }] },
      { type: "h2", children: [{ text: "Overview" }] },
      { type: "p", children: [{ text: "Brief description of the project..." }] },
      { type: "h2", children: [{ text: "Goals" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Goal 1" }] }],
          },
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Goal 2" }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Milestones" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [
              {
                type: "lic",
                children: [{ text: "[ ] Milestone 1 — Target date" }],
              },
            ],
          },
        ],
      },
      { type: "h2", children: [{ text: "Tasks" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [
              { type: "lic", children: [{ text: "[ ] Task 1" }] },
            ],
          },
        ],
      },
      { type: "h2", children: [{ text: "Resources" }] },
      { type: "p", children: [{ text: "" }] },
    ],
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    emoji: "📊",
    description: "Accomplishments, challenges, next week goals",
    content: () => [
      { type: "h1", children: [{ text: `Weekly Review — ${today()}` }] },
      { type: "h2", children: [{ text: "Accomplishments" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "What I accomplished this week..." }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Challenges" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "What was difficult..." }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Lessons Learned" }] },
      { type: "p", children: [{ text: "" }] },
      { type: "h2", children: [{ text: "Next Week Goals" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [
              { type: "lic", children: [{ text: "[ ] Goal 1" }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "reading-notes",
    name: "Reading Notes",
    emoji: "📚",
    description: "Title, author, key ideas, quotes, takeaways",
    content: () => [
      { type: "h1", children: [{ text: "Reading Notes" }] },
      { type: "p", children: [{ text: "", bold: true }, { text: "Title: " }, { text: "" }] },
      { type: "p", children: [{ text: "Author: " }, { text: "" }] },
      { type: "h2", children: [{ text: "Key Ideas" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Idea 1" }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Quotes" }] },
      { type: "blockquote", children: [{ text: "A memorable quote..." }] },
      { type: "h2", children: [{ text: "Takeaways" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Takeaway 1" }] }],
          },
        ],
      },
    ],
  },
  {
    id: "decision-log",
    name: "Decision Log",
    emoji: "⚖️",
    description: "Context, options, decision, reasoning",
    content: () => [
      { type: "h1", children: [{ text: `Decision Log — ${today()}` }] },
      { type: "h2", children: [{ text: "Context" }] },
      { type: "p", children: [{ text: "What situation requires a decision?" }] },
      { type: "h2", children: [{ text: "Options" }] },
      {
        type: "ul",
        children: [
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Option A — Pros/Cons" }] }],
          },
          {
            type: "li",
            children: [{ type: "lic", children: [{ text: "Option B — Pros/Cons" }] }],
          },
        ],
      },
      { type: "h2", children: [{ text: "Decision" }] },
      { type: "p", children: [{ text: "We decided to..." }] },
      { type: "h2", children: [{ text: "Reasoning" }] },
      { type: "p", children: [{ text: "Because..." }] },
    ],
  },
];

export function getTemplate(id: string): NoteTemplate | undefined {
  return templates.find((t) => t.id === id);
}
