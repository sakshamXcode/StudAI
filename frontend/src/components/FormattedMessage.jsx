// frontend/src/components/FormattedMessage.jsx
import React from "react";
import {
  FiHash, FiList, FiGitMerge, FiTrendingUp, FiCpu, FiFilter, FiCalendar, FiLink, FiTag, FiClock
} from "react-icons/fi";

const iconMap = {
  arrays: <FiList />, hashing: <FiHash />, "two pointers": <FiGitMerge />,
  "sliding window": <FiClock />, "linked lists": <FiLink />, trees: <FiFilter />,
  backtracking: <FiCpu />, "dynamic programming": <FiTrendingUp />, default: <FiTag />,
};

// UPDATED: A more robust function to pick icons based on common DSA topic names.
function pickIconForTitle(title = "") {
  const t = title.toLowerCase();
  if (t.includes("array") || t.includes("hash")) return iconMap.arrays;
  if (t.includes("two pointer")) return iconMap["two pointers"];
  if (t.includes("sliding window")) return iconMap["sliding window"];
  if (t.includes("linked list")) return iconMap["linked lists"];
  if (t.includes("tree")) return iconMap.trees;
  if (t.includes("backtracking")) return iconMap.backtracking;
  if (t.includes("dynamic programming") || t.includes("dp")) return iconMap["dynamic programming"];
  return iconMap.default;
}

// NEW: This function finds URLs in a string and wraps them in <a> tags.
function parseLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a href={part} key={i} target="_blank" rel="noopener noreferrer" className="fm-link">
          {part}
        </a>
      );
    }
    return part;
  });
}

// NEW: A combined parser for inline formatting (**bold**, `code`) and links.
function parseContent(text) {
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return segments.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="fm-strong">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="fm-code">{part.slice(1, -1)}</code>;
    }
    // For regular text parts, check for links.
    return parseLinks(part);
  });
}

export default function FormattedMessage({ content }) {
  if (!content || typeof content !== "string") return null;

  // Split content into blocks by one or more newlines.
  const blocks = content.split(/\n+/).map(b => b.trim()).filter(Boolean);

  const renderedNodes = [];

  blocks.forEach((block, index) => {
    // UPDATED: Treat lines ending with a colon and using **bold** as a main topic header.
    if (block.startsWith("**") && block.endsWith(":**")) {
      const title = block.slice(2, -3); // Remove ** and :**
      renderedNodes.push(
        <div key={`header-${index}`} className="fm-topic-header">
          {pickIconForTitle(title)}
          <h4 className="fm-topic-title">{title}</h4>
        </div>
      );
      return;
    }

    // UPDATED: Improved list item detection.
    const isListItem = /^\s*(\*|\d+\.)\s+/.test(block);
    if (isListItem) {
      // Clean up the messy formatting like "** 1. **" or "* **"
      let cleanedBlock = block
        .replace(/^\s*(\*|\d+\.)\s+/, "") // Remove the leading bullet/number
        .replace(/^\*\*/, "") // Remove leading bold markers
        .replace(/:\*\*$/, ":"); // Remove trailing bold colon

      // NEW: Detect and separate the metadata tags (e.g., "- Arrays, Hash Table")
      const parts = cleanedBlock.split(/\s+-\s+/);
      const mainText = parts[0];
      const tags = parts.length > 1 ? parts[1].split(',').map(tag => tag.trim()) : [];

      renderedNodes.push(
        <div key={`item-${index}`} className="fm-list-item">
          <div className="fm-list-item-main">{parseContent(mainText)}</div>
          {tags.length > 0 && (
            <div className="fm-tags-container">
              {tags.map((tag, i) => (
                <span key={i} className="fm-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      );
      return;
    }

    // Fallback for any other lines of text (like the intro paragraphs).
    renderedNodes.push(
      <p key={`p-${index}`} className="fm-paragraph">
        {parseContent(block)}
      </p>
    );
  });

  return (
    <div className="fm-root">
      {renderedNodes}
      <style jsx>{`
        .fm-root { color: #e6eef8; font-size: 15px; line-height: 1.6; }
        .fm-paragraph { margin: 8px 0; color: #cfe8ff; }
        .fm-topic-header { display: flex; align-items: center; gap: 10px; margin-top: 20px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .fm-topic-title { font-size: 16px; margin: 0; font-weight: 700; color: #fff; }
        .fm-list-item { padding: 10px; margin: 6px 0; border-radius: 8px; background: rgba(255, 255, 255, 0.04); transition: background 0.2s ease; }
        .fm-list-item:hover { background: rgba(255, 255, 255, 0.08); }
        .fm-list-item-main { color: #dbeeff; }
        .fm-strong { color: #fff; font-weight: 600; }
        .fm-code { background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; font-size: 13px; }
        .fm-link { color: #67e8f9; text-decoration: none; word-break: break-all; }
        .fm-link:hover { text-decoration: underline; }
        .fm-tags-container { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
        .fm-tag { background: rgba(0, 0, 0, 0.25); color: #a5f3fc; padding: 2px 8px; border-radius: 99px; font-size: 12px; font-weight: 500; }
      `}</style>
    </div>
  );
}