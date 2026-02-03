import React from "react";

type Props = {
  bullets: string[];
  onChange: (bullets: string[]) => void;
};

export const BulletEditor: React.FC<Props> = ({ bullets, onChange }) => {
  const update = (index: number, value: string) => {
    const next = [...bullets];
    next[index] = value;
    onChange(next);
  };

  const add = () => onChange([...bullets, ""]);

  const remove = (index: number) => {
    const next = bullets.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const move = (index: number, direction: number) => {
    const next = [...bullets];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {bullets.map((bullet, index) => (
        <div key={index} className="flex items-start gap-2">
          <textarea
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            rows={2}
            value={bullet}
            onChange={(event) => update(index, event.target.value)}
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="btn"
              onClick={() => move(index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => move(index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => remove(index)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={add}
      >
        Add bullet
      </button>
    </div>
  );
};
