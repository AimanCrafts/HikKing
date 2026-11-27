"use client";

import { ReactNode, useMemo, useState } from "react";
import { Button, EmptyState, Icon, IconName, Skeleton } from "../../components/ui";
import { cx } from "../../lib/format";

export function AdminHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[28px] font-black tracking-tight text-ink sm:text-[32px]">{title}</h1>
        {sub ? <p className="mt-1.5 max-w-xl text-[15px] text-ink2">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export type Col<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sort?: (row: T) => string | number;
  className?: string;
};

export function DataTable<T>({
  rows,
  cols,
  rowKey,
  loading,
  searchText,
  searchPlaceholder = "Search",
  empty,
  pageSize = 10,
  toolbar,
}: {
  rows: T[];
  cols: Col<T>[];
  rowKey: (r: T) => string | number;
  loading?: boolean;
  searchText?: (r: T) => string;
  searchPlaceholder?: string;
  empty?: { icon?: IconName; title: string; text?: string; action?: ReactNode };
  pageSize?: number;
  toolbar?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = needle && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(needle)) : rows;
    if (sort) {
      const col = cols.find((c) => c.key === sort.key);
      if (col?.sort) {
        const f = col.sort;
        list = [...list].sort((a, b) => {
          const x = f(a);
          const y = f(b);
          return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
        });
      }
    }
    return list;
  }, [rows, q, sort, cols, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * pageSize, cur * pageSize + pageSize);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-surface">
      {(searchText || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          {searchText ? (
            <div className="relative w-full max-w-xs">
              <Icon name="search" size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="field !h-10 !rounded-full !py-0 !pl-10 !text-sm" />
            </div>
          ) : <span />}
          {toolbar}
        </div>
      )}

      {rows.length === 0 && empty ? (
        <div className="p-6"><EmptyState {...empty} /></div>
      ) : filtered.length === 0 ? (
        <p className="p-10 text-center text-sm font-bold text-ink3">Nothing matches &ldquo;{q}&rdquo;</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-sunk/50 text-xs font-extrabold text-ink3">
                {cols.map((c) => (
                  <th key={c.key} className={cx("px-5 py-3", c.className)}>
                    {c.sort ? (
                      <button type="button" onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 }))} className="inline-flex items-center gap-1 hover:text-ink">
                        {c.header}
                        <Icon name={sort?.key === c.key ? (sort.dir === 1 ? "chevronUp" : "chevronDown") : "chevronDown"} size={13} className={sort?.key === c.key ? "text-jade" : "opacity-40"} />
                      </button>
                    ) : c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {slice.map((r) => (
                <tr key={rowKey(r)} className="transition hover:bg-sunk/40">
                  {cols.map((c) => (
                    <td key={c.key} className={cx("px-5 py-3.5 align-middle font-semibold text-ink2", c.className)}>{c.cell(r)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px] font-bold text-ink3">
          <span>{cur * pageSize + 1} to {Math.min(filtered.length, (cur + 1) * pageSize)} of {filtered.length}</span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RowActions({ onEdit, onDelete, extra }: { onEdit?: () => void; onDelete?: () => void; extra?: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {extra}
      {onEdit && (
        <button type="button" onClick={onEdit} aria-label="Edit" title="Edit" className="flex h-9 w-9 items-center justify-center rounded-full text-ink2 transition hover:bg-sunk hover:text-ink">
          <Icon name="edit" size={17} />
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label="Delete" title="Delete" className="flex h-9 w-9 items-center justify-center rounded-full text-ink3 transition hover:bg-danger-soft hover:text-danger">
          <Icon name="trash" size={17} />
        </button>
      )}
    </div>
  );
}

export function Stat({ label, value, icon, tone = "jade", hint }: { label: string; value: string | number; icon: IconName; tone?: "jade" | "warn" | "info" | "danger"; hint?: string }) {
  const tones = { jade: "bg-jade-soft text-jade", warn: "bg-warn-soft text-warn", info: "bg-info-soft text-info", danger: "bg-danger-soft text-danger" };
  return (
    <div className="rounded-[24px] border border-line bg-surface p-5">
      <span className={cx("flex h-11 w-11 items-center justify-center rounded-2xl", tones[tone])}>
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-4 text-3xl font-black tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-[13.5px] font-bold text-ink2">{label}</p>
      {hint ? <p className="mt-1 text-xs font-semibold text-ink3">{hint}</p> : null}
    </div>
  );
}

/** Wrapper so form pages stay consistent */
export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
