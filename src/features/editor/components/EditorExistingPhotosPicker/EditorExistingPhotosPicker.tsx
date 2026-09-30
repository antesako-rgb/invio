"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import EditorLibraryPhoto from "../EditorPhotoLibrary/EditorLibraryPhoto";
import styles from "../EditorPhotoLibrary/EditorPhotoLibrary.module.css";
export type ExistingPhotoPage = { photos: { id: string; imageUrl: string }[]; nextOffset: number | null };
export default function EditorExistingPhotosPicker({ loadPage, excludedIds, onAdd, onBack, disabled = false, labels }: {
  loadPage: (offset: number) => Promise<ExistingPhotoPage>;
  excludedIds: string[]; onAdd: (ids: string[]) => Promise<void>; onBack: () => void; disabled?: boolean;
  labels: { back: string; add: string; more: string; loading: string; empty: string; error: string; retry: string; select: (number: number) => string };
}) {
  const [photos, setPhotos] = useState<ExistingPhotoPage["photos"]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    let cancelled = false;
    loadPage(0).then(page => {
      if (!cancelled) { setPhotos(page.photos); setNextOffset(page.nextOffset); }
    }).catch(() => { if (!cancelled) setFailed(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loadPage]);
  const excluded = new Set(excludedIds);
  const visible = photos.filter(photo => !excluded.has(photo.id));
  const selection = selected.filter(id => !excluded.has(id));
  const busy = disabled || loading || adding;
  async function more() {
    if (lock.current || busy || nextOffset === null) return;
    lock.current = true; setLoading(true); setFailed(false);
    try {
      const page = await loadPage(nextOffset);
      setPhotos(current => [...new Map([...current, ...page.photos].map(photo => [photo.id, photo])).values()]);
      setNextOffset(page.nextOffset);
    } catch { setFailed(true); }
    finally { lock.current = false; setLoading(false); }
  }
  async function add() {
    if (lock.current || busy || !selection.length) return;
    lock.current = true; setAdding(true); setFailed(false);
    try { await onAdd(selection); } catch { setFailed(true); }
    finally { lock.current = false; setAdding(false); }
  }
  return <div className={styles.root}>
    {loading && <p role="status">{labels.loading}</p>}
    {!loading && !failed && !visible.length && <p>{labels.empty}</p>}
    <div className={styles.grid}>
      {visible.map((photo, index) => <EditorLibraryPhoto key={photo.id} selectable selected={selection.includes(photo.id)}
        disabled={busy} isUsed={false} imageUrl={photo.imageUrl} selectLabel={labels.select(index + 1)} deleteLabel="" usageBadge=""
        onSelect={() => setSelected(current => current.includes(photo.id) ? current.filter(id => id !== photo.id) : [...current, photo.id])} />)}
    </div>
    {failed && <p role="alert">{labels.error}</p>}
    {nextOffset !== null && <Button variant="outline" disabled={busy} onClick={() => void more()}>{failed ? labels.retry : labels.more}</Button>}
    <div className={styles.actions}>
      <Button variant="outline" disabled={busy} onClick={onBack}>{labels.back}</Button>
      <Button disabled={busy || !selection.length} onClick={() => void add()}>{labels.add} ({selection.length})</Button>
    </div>
  </div>;
}
