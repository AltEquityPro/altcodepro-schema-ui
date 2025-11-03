"use client";

import { cn } from "../../lib/utils";
import MDEditor from "@uiw/react-md-editor";
import { JSX, memo } from 'react';

/** Markdown Input Editor */
export function MarkdownInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("container", className)}>
      <MDEditor
        value={value}
        onChange={onChange as any}
        previewOptions={{ rehypePlugins: [] }}
      />
      <MDEditor.Markdown source={value} style={{ whiteSpace: "pre-wrap" }} />
    </div>
  );
}

interface MarkdownRenderProps {
  content: string;
  className?: string;
}

export const MarkdownRender: React.FC<MarkdownRenderProps> = memo(
  ({ content, className }) => {
    // --- Preprocess ---
    let text = content
      // Remove emojis (replace with one space)
      .replace(
        /[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F000}-\u{1FAFF}\u{2000}-\u{2BFF}\u{FE0F}]/gu,
        " "
      )
      // Ensure space between consecutive headings
      .replace(/(#+\s+\*\*[^*\n]+\*\*)(\s*#+\s+)/g, "$1\n$2")
      // Ensure newlines before tables
      .replace(/(\n)?(#+\s+[^|\n]+)\s*\|/g, "$2\n|");

    const lines = text.split(/\r?\n/);
    const elements: React.ReactNode[] = [];
    let key = 0;

    // --- Table state ---
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    // --- Inline formatter ---
    const inline = (text: string): JSX.Element => {
      if (!text) return <></>;
      let s = text
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
      return <span dangerouslySetInnerHTML={{ __html: s }} />;
    };

    // --- Flush table helper ---
    const flushTable = () => {
      if (tableHeader.length === 0) return;
      elements.push(
        <div
          key={key++}
          className="my-6 overflow-x-auto rounded-xl border border-(--acp-border) dark:border-(--acp-border-dark) shadow-sm"
        >
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-(--acp-background) dark:bg-(--acp-background-dark)">
              <tr>
                {tableHeader.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left font-semibold text-(--acp-foreground) dark:text-(--acp-foreground-dark) whitespace-nowrap border-b border-(--acp-border) dark:border-(--acp-border-dark)"
                  >
                    {inline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-(--acp-background) dark:bg-(--acp-background-dark)">
              {tableRows.map((row, i) => (
                <tr
                  key={i}
                  className="even:bg-(--acp-surface) dark:even:bg-(--acp-surface-dark)"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-2 border-b border-(--acp-border) dark:border-(--acp-border-dark) align-top text-(--acp-foreground) dark:text-(--acp-foreground-dark)"
                    >
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = [];
      tableRows = [];
      inTable = false;
    };

    // --- Main parsing loop ---
    for (let idx = 0; idx < lines.length; idx++) {
      let raw = lines[idx];
      let line = raw.trim();

      if (!line) {
        if (inTable) flushTable();
        continue;
      }

      // Headings
      const h = line.match(/^(#{1,6})\s*(.+)/);
      if (h) {
        if (inTable) flushTable();
        const lvl = Math.min(h[1].length, 6);
        const Tag = `h${lvl}` as keyof JSX.IntrinsicElements;

        // Split inline sentences: e.g. "#### Vision To become..."
        const headingText = h[2].trim();
        const parts = headingText.split(/\s{2,}|(?<=\b[A-Za-z]{3,})\s+(?=[A-Z])/);
        const [title, rest] =
          headingText.includes(" ") && /^[A-Za-z]/.test(headingText.split(" ")[0])
            ? [headingText.split(" ")[0], headingText.substring(headingText.indexOf(" ") + 1)]
            : [headingText, ""];

        // Render heading
        elements.push(
          <Tag
            key={key++}
            className={`mt-8 mb-2 font-semibold text-(--acp-foreground) dark:text-(--acp-foreground-dark)
              ${lvl === 1 ? "text-3xl" : lvl === 2 ? "text-2xl" : "text-xl"}`}
          >
            {inline(title)}
          </Tag>
        );

        // If there was trailing text, render as paragraph
        if (rest && rest.trim().length > 0) {
          elements.push(
            <p
              key={key++}
              className="mb-3 text-(--acp-foreground) dark:text-(--acp-foreground-dark)"
            >
              {inline(rest.trim())}
            </p>
          );
        }
        continue;
      }

      // Tables
      if (line.includes("|")) {
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean);
        if (cells.length > 1) {
          if (/^[-:\s]+$/.test(cells.join(""))) continue;
          if (!inTable) {
            inTable = true;
            tableHeader = cells;
          } else {
            while (cells.length < tableHeader.length) cells.push("");
            tableRows.push(cells.slice(0, tableHeader.length));
          }
          continue;
        }
      }

      if (inTable) flushTable();

      // Lists
      const listMatch = line.match(/^[-*]\s+(.+)/);
      if (listMatch) {
        elements.push(
          <li
            key={key++}
            className="ml-6 list-disc mb-1 text-(--acp-foreground) dark:text-(--acp-foreground-dark)"
          >
            {inline(listMatch[1])}
          </li>
        );
        continue;
      }

      // Bold-only line
      if (/^\*\*.+\*\*$/.test(line)) {
        elements.push(
          <p
            key={key++}
            className="font-bold text-lg mt-4 mb-2 text-(--acp-foreground) dark:text-(--acp-foreground-dark)"
          >
            {inline(line.replace(/\*\*/g, ""))}
          </p>
        );
        continue;
      }

      // Normal paragraph
      elements.push(
        <p
          key={key++}
          className="mb-3 text-(--acp-foreground) dark:text-(--acp-foreground-dark)"
        >
          {inline(line)}
        </p>
      );
    }

    if (inTable) flushTable();

    return (
      <div
        className={`prose max-w-none text-(--acp-foreground) dark:text-(--acp-foreground-dark) ${className ?? ""}`}
      >
        {elements}
      </div>
    );
  }
);

MarkdownRender.displayName = "MarkdownRender";
