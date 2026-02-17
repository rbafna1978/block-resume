import React from "react";
import { GroupBlock, SectionItem, SectionType } from "@/lib/schema";
import { ItemEditor } from "@/components/ItemEditor";

type Props = {
  type: SectionType;
  group: GroupBlock;
  onChange: (group: GroupBlock) => void;
  onRemove: () => void;
};

export const GroupEditor: React.FC<Props> = ({ type, group, onChange, onRemove }) => {
  const updateItem = (index: number, item: SectionItem) => {
    const nextItems = [...group.items];
    nextItems[index] = item;
    onChange({ ...group, items: nextItems });
  };

  const addItem = (item: SectionItem) => onChange({ ...group, items: [...group.items, item] });

  const removeItem = (index: number) => {
    const nextItems = group.items.filter((_, idx) => idx !== index);
    onChange({ ...group, items: nextItems });
  };

  const duplicateItem = (index: number) => {
    const source = group.items[index];
    if (!source) return;
    const nextItems = [...group.items];
    nextItems.splice(index + 1, 0, { ...source });
    onChange({ ...group, items: nextItems });
  };

  const moveItem = (index: number, direction: number) => {
    const nextItems = [...group.items];
    const target = index + direction;
    if (target < 0 || target >= nextItems.length) return;
    [nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]];
    onChange({ ...group, items: nextItems });
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between">
        <input
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          placeholder="Group title"
          value={group.title}
          onChange={(event) => onChange({ ...group, title: event.target.value })}
        />
        <button type="button" className="btn btn-danger ml-2" onClick={onRemove}>
          Delete group
        </button>
      </div>
      <div className="space-y-2">
        {group.items.map((item, index) => (
          <div key={index} className="space-y-2">
            <ItemEditor type={type} item={item} onChange={(next) => updateItem(index, next)} />
            <div className="flex gap-2">
              <button type="button" className="btn" onClick={() => duplicateItem(index)}>
                Duplicate
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => moveItem(index, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => moveItem(index, 1)}
              >
                Move down
              </button>
              <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>
                Delete item
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn"
          onClick={() => addItem(createItem(type))}
        >
          Add item
        </button>
      </div>
    </div>
  );
};

const createItem = (type: SectionType): SectionItem => {
  switch (type) {
    case "education":
      return {
        kind: "education",
        school: "",
        location: "",
        degreeLine: "",
        dateRight: "",
        bullets: [],
      };
    case "experience":
    case "research_experience":
    case "leadership_experience":
    case "positions_of_responsibility":
    case "volunteer_experience":
      return {
        kind: "experience",
        role: "",
        dateRight: "",
        company: "",
        location: "",
        bullets: [],
      };
    case "projects":
    case "hackathons":
    case "additional_projects":
      return {
        kind: "projects",
        left: "",
        dateRight: "",
        bullets: [],
      };
    case "publications":
    case "certifications":
    case "awards":
    case "achievements":
    case "generic_entries":
      return {
        kind: "generic_entries",
        headingLeft: "",
        headingRight: "",
        subLeft: "",
        subRight: "",
        bullets: [],
      };
    case "activities":
    case "extracurriculars":
    case "coursework":
    case "interests":
    case "highlights":
    case "generic_bullets":
      return {
        kind: "generic_bullets",
        bullets: [],
      };
    case "summary":
      return {
        kind: "summary",
        text: "",
      };
    case "skills":
    default:
      return {
        kind: "skills",
        categories: [],
      };
  }
};
