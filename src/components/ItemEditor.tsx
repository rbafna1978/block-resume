import React from "react";
import {
  SectionType,
  SectionItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillsItem,
  SummaryItem,
  GenericEntryItem,
  GenericBulletsItem,
} from "@/lib/schema";
import { BulletEditor } from "@/components/BulletEditor";

type Props = {
  type: SectionType;
  item: SectionItem;
  onChange: (next: SectionItem) => void;
};

export const ItemEditor: React.FC<Props> = ({ type, item, onChange }) => {
  const effectiveType = normalizeSectionType(type);

  if (effectiveType === "education" && item.kind === "education") {
    const update = (patch: Partial<EducationItem>) => onChange({ ...item, ...patch });
    return (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="School"
            value={item.school}
            onChange={(event) => update({ school: event.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Location"
            value={item.location}
            onChange={(event) => update({ location: event.target.value })}
          />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Degree line"
            value={item.degreeLine}
            onChange={(event) => update({ degreeLine: event.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Date right"
            value={item.dateRight}
            onChange={(event) => update({ dateRight: event.target.value })}
          />
        </div>
        <BulletEditor bullets={item.bullets ?? []} onChange={(bullets) => update({ bullets })} />
      </div>
    );
  }

  if (effectiveType === "experience" && item.kind === "experience") {
    const update = (patch: Partial<ExperienceItem>) => onChange({ ...item, ...patch });
    return (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Role"
            value={item.role}
            onChange={(event) => update({ role: event.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Date right"
            value={item.dateRight}
            onChange={(event) => update({ dateRight: event.target.value })}
          />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Company"
            value={item.company}
            onChange={(event) => update({ company: event.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Location"
            value={item.location}
            onChange={(event) => update({ location: event.target.value })}
          />
        </div>
        <BulletEditor bullets={item.bullets} onChange={(bullets) => update({ bullets })} />
      </div>
    );
  }

  if (effectiveType === "projects" && item.kind === "projects") {
    const update = (patch: Partial<ProjectItem>) => onChange({ ...item, ...patch });
    return (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Left heading"
            value={item.left}
            onChange={(event) => update({ left: event.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Date right"
            value={item.dateRight}
            onChange={(event) => update({ dateRight: event.target.value })}
          />
        </div>
        <BulletEditor bullets={item.bullets} onChange={(bullets) => update({ bullets })} />
      </div>
    );
  }

  if (effectiveType === "skills" && item.kind === "skills") {
    const updateCategory = (index: number, patch: Partial<SkillsItem["categories"][number]>) => {
      const next = [...item.categories];
      next[index] = { ...next[index], ...patch };
      onChange({ ...item, categories: next });
    };

    const addCategory = () =>
      onChange({ ...item, categories: [...item.categories, { label: "", value: "" }] });

    const removeCategory = (index: number) => {
      const next = item.categories.filter((_, idx) => idx !== index);
      onChange({ ...item, categories: next });
    };

    const moveCategory = (index: number, direction: number) => {
      const next = [...item.categories];
      const target = index + direction;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      onChange({ ...item, categories: next });
    };

    return (
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        {item.categories.map((category, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 md:grid-cols-2">
              <input
                className="rounded-lg border border-slate-200 p-2 text-sm"
                placeholder="Label"
                value={category.label}
                onChange={(event) => updateCategory(index, { label: event.target.value })}
              />
              <input
                className="rounded-lg border border-slate-200 p-2 text-sm"
                placeholder="Value"
                value={category.value}
                onChange={(event) => updateCategory(index, { value: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className="btn"
                onClick={() => moveCategory(index, -1)}
              >
                Up
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => moveCategory(index, 1)}
              >
                Down
              </button>
              <button type="button" className="btn btn-danger" onClick={() => removeCategory(index)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={addCategory}
        >
          Add category
        </button>
      </div>
    );
  }

  if (effectiveType === "summary" && item.kind === "summary") {
    const update = (patch: Partial<SummaryItem>) => onChange({ ...item, ...patch });
    return (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
        <textarea
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          rows={4}
          placeholder="Summary paragraph"
          value={item.text}
          onChange={(event) => update({ text: event.target.value })}
        />
      </div>
    );
  }

  if (effectiveType === "generic_entries" && item.kind === "generic_entries") {
    const update = (patch: Partial<GenericEntryItem>) => onChange({ ...item, ...patch });
    return (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Heading left"
            value={item.headingLeft}
            onChange={(event) => update({ headingLeft: event.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Heading right"
            value={item.headingRight}
            onChange={(event) => update({ headingRight: event.target.value })}
          />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Sub left"
            value={item.subLeft ?? ""}
            onChange={(event) => update({ subLeft: event.target.value })}
          />
          <input
            className="rounded-lg border border-slate-200 p-2 text-sm"
            placeholder="Sub right"
            value={item.subRight ?? ""}
            onChange={(event) => update({ subRight: event.target.value })}
          />
        </div>
        <BulletEditor bullets={item.bullets} onChange={(bullets) => update({ bullets })} />
      </div>
    );
  }

  if (effectiveType === "generic_bullets" && item.kind === "generic_bullets") {
    return (
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
        <BulletEditor
          bullets={(item as GenericBulletsItem).bullets}
          onChange={(bullets) => onChange({ ...item, bullets })}
        />
      </div>
    );
  }

  return null;
};

const normalizeSectionType = (type: SectionType) => {
  switch (type) {
    case "leadership_experience":
    case "volunteer_experience":
      return "experience";
    case "additional_projects":
      return "projects";
    case "publications":
    case "certifications":
    case "awards":
      return "generic_entries";
    case "activities":
    case "coursework":
    case "interests":
    case "highlights":
      return "generic_bullets";
    default:
      return type;
  }
};
