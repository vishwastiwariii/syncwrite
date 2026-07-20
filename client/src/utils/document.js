/* Document display helpers shared by the dashboard and its cards. */

/* Thumbnail palettes cycled per card — straight from the design system. */
export const THUMBS = [
  { bg: "repeating-linear-gradient(135deg,#F6F4FF,#F6F4FF 9px,#fff 9px,#fff 18px)", a: "#d9d2ff", b: "#eceaf3" },
  { bg: "#EAF1FF", a: "#b9cfff", b: "#dbe6ff" },
  { bg: "#FBF1E4", a: "#f0cd9a", b: "#f6e2c8" },
  { bg: "#EAF7F0", a: "#a9e0c4", b: "#d3efe0" },
  { bg: "#FCEBEF", a: "#ef9bb1", b: "#f7d3dd" },
  { bg: "#EEF3F8", a: "#c7d2de", b: "#e3eaf1" },
];

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMs = Date.now() - date;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* Rough word count off the stored content string. */
export const wordCount = (content) => {
  const text = String(content || "").replace(/<[^>]*>/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
};
