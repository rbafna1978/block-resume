import React from "react";
import { SectionBlock, SectionItem, SectionType, GroupBlock } from "@/lib/schema";
import { ItemEditor } from "@/components/ItemEditor";
import { GroupEditor } from "@/components/GroupEditor";
import { createId } from "@/lib/id";

type Props = {
  section: SectionBlock;
  onChange: (section: SectionBlock) => void;
  onRemove: () => void;
};

export const SectionEditor: React.FC<Props> = ({ section, onChange, onRemove }) => {
  const updateItem = (index: number, item: SectionItem) => {
    const nextItems = [...section.items];
    nextItems[index] = item;
    onChange({ ...section, items: nextItems });
  };

  const addItem = (item: SectionItem) => onChange({ ...section, items: [...section.items, item] });

  const removeItem = (index: number) => {
    const nextItems = section.items.filter((_, idx) => idx !== index);
    onChange({ ...section, items: nextItems });
  };

  const duplicateItem = (index: number) => {
    const source = section.items[index];
    if (!source) return;
    const nextItems = [...section.items];
    nextItems.splice(index + 1, 0, { ...source });
    onChange({ ...section, items: nextItems });
  };

  const moveItem = (index: number, direction: number) => {
    const nextItems = [...section.items];
    const target = index + direction;
    if (target < 0 || target >= nextItems.length) return;
    [nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]];
    onChange({ ...section, items: nextItems });
  };

  const updateGroup = (index: number, group: GroupBlock) => {
    if (!section.groups) return;
    const nextGroups = [...section.groups];
    nextGroups[index] = group;
    onChange({ ...section, groups: nextGroups });
  };

  const addGroup = () => {
    const nextGroups = section.groups ? [...section.groups] : [];
    nextGroups.push({ id: createId("group"), title: "New Group", items: [] });
    onChange({ ...section, groups: nextGroups });
  };

  const removeGroup = (index: number) => {
    if (!section.groups) return;
    const nextGroups = section.groups.filter((_, idx) => idx !== index);
    onChange({ ...section, groups: nextGroups });
  };

  const moveGroup = (index: number, direction: number) => {
    if (!section.groups) return;
    const nextGroups = [...section.groups];
    const target = index + direction;
    if (target < 0 || target >= nextGroups.length) return;
    [nextGroups[index], nextGroups[target]] = [nextGroups[target], nextGroups[index]];
    onChange({ ...section, groups: nextGroups });
  };

  const duplicateGroup = (index: number) => {
    if (!section.groups) return;
    const source = section.groups[index];
    if (!source) return;
    const nextGroups = [...section.groups];
    nextGroups.splice(index + 1, 0, {
      ...source,
      id: createId("group"),
      title: `${source.title} (Copy)`,
      items: [...source.items],
    });
    onChange({ ...section, groups: nextGroups });
  };

  const toggleGroups = () => {
    if (section.groups && section.groups.length > 0) {
      onChange({ ...section, groups: undefined });
    } else {
      onChange({ ...section, groups: [] });
    }
  };

  const canGroup = section.type !== "skills" && section.type !== "summary";

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 p-2 text-sm"
          value={section.title}
          onChange={(event) => onChange({ ...section, title: event.target.value })}
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={section.visible}
            onChange={(event) => onChange({ ...section, visible: event.target.checked })}
          />
          Visible
        </label>
        <button type="button" className="btn btn-danger" onClick={onRemove}>
          Delete section
        </button>
      </div>

      {canGroup && (
        <button
          type="button"
          className="btn"
          onClick={toggleGroups}
        >
          {section.groups && section.groups.length > 0 ? "Remove groups" : "Enable groups"}
        </button>
      )}

      {section.groups && section.groups.length > 0 ? (
        <div className="space-y-3">
          {section.groups.map((group, index) => (
            <div key={group.id} className="space-y-2">
              <GroupEditor
                type={section.type}
                group={group}
                onChange={(next) => updateGroup(index, next)}
                onRemove={() => removeGroup(index)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => duplicateGroup(index)}
                >
                  Duplicate group
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => moveGroup(index, -1)}
                >
                  Move group up
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => moveGroup(index, 1)}
                >
                  Move group down
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn"
            onClick={addGroup}
          >
            Add group
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {section.items.map((item, index) => (
            <div key={index} className="space-y-2">
              <ItemEditor type={section.type} item={item} onChange={(next) => updateItem(index, next)} />
              <div className="flex gap-2">
                <button type="button" className="btn" onClick={() => duplicateItem(index)}>
                  Duplicate item
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => moveItem(index, -1)}
                >
                  Move item up
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => moveItem(index, 1)}
                >
                  Move item down
                </button>
                <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>
                  Delete item
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn"
            onClick={() => addItem(createItem(section.type))}
          >
            Add item
          </button>
        </div>
      )}
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
