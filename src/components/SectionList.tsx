import React, { useState } from "react";
import { SectionBlock, SectionItem, SectionType } from "@/lib/schema";

type Props = {
  sections: SectionBlock[];
  onChange: (sections: SectionBlock[]) => void;
};

const sectionLabels: Record<SectionType, string> = {
  education: "Education",
  experience: "Experience",
  leadership_experience: "Leadership Experience",
  volunteer_experience: "Volunteer Experience",
  projects: "Projects",
  additional_projects: "Additional Projects",
  skills: "Skills",
  summary: "Summary",
  publications: "Publications",
  certifications: "Certifications",
  awards: "Awards",
  activities: "Activities",
  coursework: "Coursework",
  interests: "Interests",
  highlights: "Highlights",
  generic_bullets: "Generic Bullets",
  generic_entries: "Generic Entries",
};

const presets: Array<{ label: string; type: SectionType; title: string }> = [
  { label: "Summary", type: "summary", title: "Summary" },
  { label: "Leadership", type: "leadership_experience", title: "Leadership Experience" },
  { label: "Volunteer", type: "volunteer_experience", title: "Volunteer Experience" },
  { label: "Publications", type: "publications", title: "Publications" },
  { label: "Certifications", type: "certifications", title: "Certifications" },
  { label: "Awards", type: "awards", title: "Awards" },
  { label: "Activities", type: "activities", title: "Activities" },
  { label: "Coursework", type: "coursework", title: "Relevant Coursework" },
  { label: "Interests", type: "interests", title: "Interests" },
  { label: "Highlights", type: "highlights", title: "Highlights" },
  { label: "Projects (Other)", type: "additional_projects", title: "Additional Projects" },
];

export const SectionList: React.FC<Props> = ({ sections, onChange }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const addSection = (type: SectionType, titleOverride?: string) => {
    const next: SectionBlock = {
      id: `section-${Date.now()}`,
      type,
      title: titleOverride ?? sectionLabels[type],
      visible: true,
      items: createInitialItems(type),
    };
    onChange([...sections, next]);
  };

  const removeSection = (index: number) => {
    const next = sections.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const moveSection = (from: number, to: number) => {
    if (from === to) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragIndex === null) return;
            moveSection(dragIndex, index);
            setDragIndex(null);
          }}
        >
          <div>
            <div className="text-sm font-medium">{section.title}</div>
            <div className="text-xs text-slate-500">{section.type}</div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-danger" onClick={() => removeSection(index)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="btn"
            onClick={() => addSection(preset.type, preset.title)}
          >
            Add {preset.label}
          </button>
        ))}
        {(Object.keys(sectionLabels) as SectionType[]).map((type) => (
          <button
            key={type}
            type="button"
            className="btn"
            onClick={() => addSection(type)}
          >
            Add {sectionLabels[type]}
          </button>
        ))}
      </div>
    </div>
  );
};

const createInitialItems = (type: SectionType): SectionItem[] => {
  switch (type) {
    case "skills":
      return [{ kind: "skills" as const, categories: [] }];
    case "summary":
      return [{ kind: "summary" as const, text: "" }];
    case "leadership_experience":
    case "volunteer_experience":
      return [
        {
          kind: "experience" as const,
          role: "",
          dateRight: "",
          company: "",
          location: "",
          bullets: [],
        },
      ];
    case "additional_projects":
      return [{ kind: "projects" as const, left: "", dateRight: "", bullets: [] }];
    case "publications":
    case "certifications":
    case "awards":
      return [
        {
          kind: "generic_entries" as const,
          headingLeft: "",
          headingRight: "",
          subLeft: "",
          subRight: "",
          bullets: [],
        },
      ];
    case "activities":
    case "coursework":
    case "interests":
    case "highlights":
      return [{ kind: "generic_bullets" as const, bullets: [] }];
    case "generic_bullets":
      return [{ kind: "generic_bullets" as const, bullets: [] }];
    case "generic_entries":
      return [
        {
          kind: "generic_entries" as const,
          headingLeft: "",
          headingRight: "",
          bullets: [],
        },
      ];
    case "education":
      return [
        {
          kind: "education" as const,
          school: "",
          location: "",
          degreeLine: "",
          dateRight: "",
          bullets: [],
        },
      ];
    case "experience":
      return [
        {
          kind: "experience" as const,
          role: "",
          dateRight: "",
          company: "",
          location: "",
          bullets: [],
        },
      ];
    case "projects":
    default:
      return [{ kind: "projects" as const, left: "", dateRight: "", bullets: [] }];
  }
};
