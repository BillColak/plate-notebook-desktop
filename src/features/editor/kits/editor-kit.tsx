
import { TrailingBlockPlugin, type Value } from "platejs";
import { type TPlateEditor, useEditorRef } from "platejs/react";

import { AIKit } from "@/features/editor/kits/ai-kit";
import { AlignKit } from "@/features/editor/kits/align-kit";
import { AutoformatKit } from "@/features/editor/kits/autoformat-kit";
import { BasicBlocksKit } from "@/features/editor/kits/basic-blocks-kit";
import { BasicMarksKit } from "@/features/editor/kits/basic-marks-kit";
import { BlockMenuKit } from "@/features/editor/kits/block-menu-kit";
import { BlockPlaceholderKit } from "@/features/editor/kits/block-placeholder-kit";
import { CalloutKit } from "@/features/editor/kits/callout-kit";
import { CodeBlockKit } from "@/features/editor/kits/code-block-kit";
import { ColumnKit } from "@/features/editor/kits/column-kit";
import { CommentKit } from "@/features/editor/kits/comment-kit";
import { CopilotKit } from "@/features/editor/kits/copilot-kit";
import { CursorOverlayKit } from "@/features/editor/kits/cursor-overlay-kit";
import { DateKit } from "@/features/editor/kits/date-kit";
import { DiscussionKit } from "@/features/editor/kits/discussion-kit";
import { DndKit } from "@/features/editor/kits/dnd-kit";
import { DocxKit } from "@/features/editor/kits/docx-kit";
import { EmojiKit } from "@/features/editor/kits/emoji-kit";
import { ExitBreakKit } from "@/features/editor/kits/exit-break-kit";
import { FixedToolbarKit } from "@/features/editor/kits/fixed-toolbar-kit";
import { FloatingToolbarKit } from "@/features/editor/kits/floating-toolbar-kit";
import { FontKit } from "@/features/editor/kits/font-kit";
import { LineHeightKit } from "@/features/editor/kits/line-height-kit";
import { LinkKit } from "@/features/editor/kits/link-kit";
import { ListKit } from "@/features/editor/kits/list-kit";
import { MarkdownKit } from "@/features/editor/kits/markdown-kit";
import { MathKit } from "@/features/editor/kits/math-kit";
import { MediaKit } from "@/features/editor/kits/media-kit";
import { MentionKit } from "@/features/editor/kits/mention-kit";
import { SlashKit } from "@/features/editor/kits/slash-kit";
import { SuggestionKit } from "@/features/editor/kits/suggestion-kit";
import { TableKit } from "@/features/editor/kits/table-kit";
import { TocKit } from "@/features/editor/kits/toc-kit";
import { ToggleKit } from "@/features/editor/kits/toggle-kit";

export const EditorKit = [
  ...CopilotKit,
  ...AIKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...CalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...MentionKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...BlockMenuKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
