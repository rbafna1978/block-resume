export type SectionType =
  | "education"
  | "experience"
  | "leadership_experience"
  | "volunteer_experience"
  | "projects"
  | "additional_projects"
  | "skills"
  | "summary"
  | "publications"
  | "certifications"
  | "awards"
  | "activities"
  | "coursework"
  | "interests"
  | "highlights"
  | "generic_bullets"
  | "generic_entries";

export type ResumeDocument = {
  meta: {
    title: string;
    pdfTitle: string;
    updatedAt: string;
  };
  header: {
    name: string;
    location: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
    links: Array<{ label: string; url: string }>;
  };
  blocks: SectionBlock[];
};

export type SectionBlock = {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  groups?: GroupBlock[];
  items: SectionItem[];
};

export type GroupBlock = {
  id: string;
  title: string;
  items: SectionItem[];
};

export type EducationItem = {
  kind: "education";
  school: string;
  location: string;
  degreeLine: string;
  dateRight: string;
  bullets?: string[];
};

export type ExperienceItem = {
  kind: "experience";
  role: string;
  dateRight: string;
  company: string;
  location: string;
  bullets: string[];
};

export type ProjectItem = {
  kind: "projects";
  left: string;
  dateRight: string;
  bullets: string[];
};

export type SkillsItem = {
  kind: "skills";
  categories: Array<{ label: string; value: string }>;
};

export type SummaryItem = {
  kind: "summary";
  text: string;
};

export type GenericBulletsItem = {
  kind: "generic_bullets";
  bullets: string[];
};

export type GenericEntryItem = {
  kind: "generic_entries";
  headingLeft: string;
  headingRight: string;
  subLeft?: string;
  subRight?: string;
  bullets: string[];
};

export type SectionItem =
  | EducationItem
  | ExperienceItem
  | ProjectItem
  | SkillsItem
  | SummaryItem
  | GenericBulletsItem
  | GenericEntryItem;

const isString = (value: unknown) => typeof value === "string";
const isBool = (value: unknown) => typeof value === "boolean";
const isArray = (value: unknown) => Array.isArray(value);

const isSectionType = (value: unknown): value is SectionType =>
  value === "education" ||
  value === "experience" ||
  value === "leadership_experience" ||
  value === "volunteer_experience" ||
  value === "projects" ||
  value === "additional_projects" ||
  value === "skills" ||
  value === "summary" ||
  value === "publications" ||
  value === "certifications" ||
  value === "awards" ||
  value === "activities" ||
  value === "coursework" ||
  value === "interests" ||
  value === "highlights" ||
  value === "generic_bullets" ||
  value === "generic_entries";

const hasKeys = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const validateResumeDocument = (value: unknown): value is ResumeDocument => {
  if (!hasKeys(value)) return false;
  const meta = value.meta;
  const header = value.header;
  const blocks = value.blocks;
  if (!hasKeys(meta) || !hasKeys(header) || !isArray(blocks)) return false;
  if (!isString(meta.title) || !isString(meta.pdfTitle) || !isString(meta.updatedAt)) return false;
  if (
    !isString(header.name) ||
    !isString(header.location) ||
    !isString(header.phone) ||
    !isString(header.email) ||
    !isString(header.linkedin) ||
    !isString(header.github) ||
    !isArray(header.links)
  ) {
    return false;
  }
  for (const link of header.links) {
    if (!hasKeys(link) || !isString(link.label) || !isString(link.url)) return false;
  }

  for (const block of blocks) {
    if (!hasKeys(block)) return false;
    if (!isString(block.id) || !isSectionType(block.type) || !isString(block.title)) return false;
    if (!isBool(block.visible)) return false;
    if (!isArray(block.items)) return false;
    if (block.groups !== undefined) {
      if (!isArray(block.groups)) return false;
      for (const group of block.groups) {
        if (!hasKeys(group) || !isString(group.id) || !isString(group.title) || !isArray(group.items)) {
          return false;
        }
      }
    }
  }

  return true;
};
