import fs from "fs";
import path from "path";
import {
  ResumeDocument,
  SectionBlock,
  SectionItem,
  GroupBlock,
  SkillsItem,
  SummaryItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  GenericBulletsItem,
  GenericEntryItem,
} from "@/lib/schema";

const replacements: Array<[RegExp, string]> = [
  [/\\/g, "\\textbackslash{}"],
  [/\{/g, "\\{"],
  [/\}/g, "\\}"],
  [/#/g, "\\#"],
  [/\$/g, "\\$"],
  [/%/g, "\\%"],
  [/&/g, "\\&"],
  [/_/g, "\\_"],
  [/~/g, "\\textasciitilde{}"],
  [/\^/g, "\\textasciicircum{}"],
];

const normalizeQuotes = (value: string) =>
  value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

export const escapeLatex = (value: string) => {
  let output = normalizeQuotes(value);
  output = output.replace(/[\r\n]+/g, " ");
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output.trim();
};

const sanitizeUrlText = (value: string) => escapeLatex(value.replace(/^https?:\/\//, ""));

const ensureHttps = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const extractLinkedInSlug = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const match = withoutProtocol.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (match && match[1]) return match[1];
  const parts = withoutProtocol.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
};

const extractGithubHandle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const match = withoutProtocol.match(/github\.com\/([^/?#]+)/i);
  if (match && match[1]) return match[1];
  const parts = withoutProtocol.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
};

const loadTemplate = () => {
  const templatePath = path.join(process.cwd(), "template.tex");
  return fs.readFileSync(templatePath, "utf8");
};

const renderBulletList = (bullets: string[]) => {
  if (!bullets || bullets.length === 0) return "";
  const items = bullets
    .filter((bullet) => bullet.trim().length > 0)
    .map((bullet) => `  \\resumeItem{${escapeLatex(bullet)}}`)
    .join("\n");
  return ["  \\resumeItemListStart", items, "  \\resumeItemListEnd"].join("\n");
};

const renderEducationItem = (item: EducationItem) => {
  const lines = [
    "  \\resumeSubheading",
    `    {${escapeLatex(item.school)}}{${escapeLatex(item.location)}}`,
    `    {${escapeLatex(item.degreeLine)}}{${escapeLatex(item.dateRight)}}`,
  ];
  const bullets = item.bullets && item.bullets.length > 0 ? renderBulletList(item.bullets) : "";
  if (bullets) lines.push(bullets);
  return lines.join("\n");
};

const renderExperienceItem = (item: ExperienceItem) => {
  const lines = [
    "  \\resumeSubheading",
    `  {${escapeLatex(item.role)}}{${escapeLatex(item.dateRight)}}`,
    `  {${escapeLatex(item.company)}}{${escapeLatex(item.location)}}`,
    renderBulletList(item.bullets),
  ];
  return lines.join("\n");
};

const renderProjectItem = (item: ProjectItem) => {
  const lines = [
    "  \\resumeProjectHeading",
    `  {${escapeLatex(item.left)}}{${escapeLatex(item.dateRight)}}`,
    renderBulletList(item.bullets),
  ];
  return lines.join("\n");
};

const renderGenericEntryItem = (item: GenericEntryItem) => {
  const headingLeft = escapeLatex(item.headingLeft);
  const headingRight = escapeLatex(item.headingRight);
  const subLeft = item.subLeft ? escapeLatex(item.subLeft) : "";
  const subRight = item.subRight ? escapeLatex(item.subRight) : "";
  const lines = [
    "  \\resumeSubheading",
    `  {${headingLeft}}{${headingRight}}`,
    `  {${subLeft}}{${subRight}}`,
    renderBulletList(item.bullets),
  ];
  return lines.join("\n");
};

const renderGenericBulletsItem = (item: GenericBulletsItem) => renderBulletList(item.bullets);

const renderSummaryItem = (item: SummaryItem) => {
  if (item.text.trim().length === 0) return "";
  const paragraphs = item.text
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(escapeLatex)
        .join(" \\\\ ")
    )
    .filter((paragraph) => paragraph.length > 0);
  return `\\small{${paragraphs.join(" \\\\par ")}}`;
};

const renderSkillsItem = (item: SkillsItem) => {
  const rows = item.categories
    .filter((category) => category.label.trim().length > 0 || category.value.trim().length > 0)
    .map((category) => `\\textbf{${escapeLatex(category.label)}}: ${escapeLatex(category.value)}`)
    .join(" \\\\\n  ");

  return [
    "\\begin{itemize}[leftmargin=0.15in, label={}]",
    "\\small{",
    "\\item{",
    `  ${rows}`,
    "}",
    "}",
    "\\end{itemize}",
  ].join("\n");
};

const renderItem = (item: SectionItem) => {
  switch (item.kind) {
    case "education":
      return renderEducationItem(item);
    case "experience":
      return renderExperienceItem(item);
    case "projects":
      return renderProjectItem(item);
    case "skills":
      return renderSkillsItem(item);
    case "summary":
      return renderSummaryItem(item);
    case "generic_bullets":
      return renderGenericBulletsItem(item);
    case "generic_entries":
      return renderGenericEntryItem(item);
    default:
      return "";
  }
};

const renderGroup = (group: GroupBlock, sectionType: SectionBlock["type"]) => {
  const heading = `  \\resumeSubSubheading{${escapeLatex(group.title)}}{}`;
  const items = group.items.map(renderItem).filter(Boolean).join("\n\n");
  if (sectionType === "skills" || sectionType === "summary") {
    return items;
  }
  return [heading, items].filter(Boolean).join("\n");
};

const normalizeSectionType = (type: SectionBlock["type"]) => {
  switch (type) {
    case "research_experience":
    case "leadership_experience":
    case "positions_of_responsibility":
    case "volunteer_experience":
      return "experience";
    case "hackathons":
    case "additional_projects":
      return "projects";
    case "publications":
    case "certifications":
    case "awards":
    case "achievements":
      return "generic_entries";
    case "activities":
    case "extracurriculars":
    case "coursework":
    case "interests":
    case "highlights":
      return "generic_bullets";
    default:
      return type;
  }
};

const renderSection = (section: SectionBlock) => {
  if (!section.visible) return "";
  const header = `\\section{${escapeLatex(section.title)}}`;
  const normalizedType = normalizeSectionType(section.type);
  if (normalizedType === "skills") {
    const item = section.items[0] as SkillsItem | undefined;
    const skillsBody = item ? renderSkillsItem(item) : "";
    return [header, skillsBody].filter(Boolean).join("\n");
  }
  if (normalizedType === "summary") {
    const item = section.items[0] as SummaryItem | undefined;
    const summaryBody = item ? renderSummaryItem(item) : "";
    return [header, summaryBody].filter(Boolean).join("\n");
  }

  const listStart = "\\resumeSubHeadingListStart";
  const listEnd = "\\resumeSubHeadingListEnd";

  let content = "";
  if (section.groups && section.groups.length > 0) {
    content = section.groups.map((group) => renderGroup(group, section.type)).join("\n\n");
  } else {
    const renderedItems = section.items.map(renderItem).filter(Boolean);
    if (normalizedType === "education" && renderedItems.length > 1) {
      content = renderedItems.join("\n\n\\vspace{2pt}\n\n");
    } else {
      content = renderedItems.join("\n\n");
    }
  }

  if (normalizedType === "generic_bullets") {
    return [header, content].filter(Boolean).join("\n");
  }

  return [header, listStart, content, listEnd].filter(Boolean).join("\n");
};

export const renderLatex = (doc: ResumeDocument) => {
  const template = loadTemplate();
  const linkedinSlug = extractLinkedInSlug(doc.header.linkedin);
  const githubHandle = extractGithubHandle(doc.header.github);
  const linkedinUrl = ensureHttps(`www.linkedin.com/in/${linkedinSlug}`);
  const githubUrl = ensureHttps(`github.com/${githubHandle}`);
  const extraLinks = doc.header.links
    .filter((link) => link.label.trim().length > 0 && link.url.trim().length > 0)
    .map((link) => {
      const url = escapeLatex(ensureHttps(link.url.trim()));
      const label = escapeLatex(link.label.trim());
      return ` $|$ \\href{${url}}{\\underline{${label}}}`;
    })
    .join("");

  const body = doc.blocks.map(renderSection).filter(Boolean).join("\n\n");

  return template
    .replace(/\{\{PDF_TITLE\}\}/g, escapeLatex(doc.meta.pdfTitle))
    .replace(/\{\{NAME\}\}/g, escapeLatex(doc.header.name))
    .replace(/\{\{LOCATION\}\}/g, escapeLatex(doc.header.location))
    .replace(/\{\{PHONE\}\}/g, escapeLatex(doc.header.phone))
    .replace(/\{\{EMAIL\}\}/g, escapeLatex(doc.header.email))
    .replace(/\{\{LINKEDIN_URL\}\}/g, escapeLatex(linkedinUrl))
    .replace(/\{\{LINKEDIN_TEXT\}\}/g, sanitizeUrlText(`linkedin.com/in/${linkedinSlug}`))
    .replace(/\{\{GITHUB_URL\}\}/g, escapeLatex(githubUrl))
    .replace(/\{\{GITHUB_TEXT\}\}/g, sanitizeUrlText(`github.com/${githubHandle}`))
    .replace(/\{\{EXTRA_LINKS\}\}/g, extraLinks)
    .replace(/\{\{BODY\}\}/g, body);
};
