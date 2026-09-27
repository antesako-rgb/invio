"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./DigitalAlbumPhotosPanel.module.css";

interface Props {
  selectable: boolean;
  selected: boolean;
  isUsed: boolean;
  imageUrl: string;
  selectLabel: string;
  deleteLabel: string;
  usageBadge: string;
  onSelect: () => void;
  onDelete: () => void;
}

// Sibling controls: only the explicit trash button owns delete intent.
export default function DigitalAlbumLibraryPhoto({ selectable, selected, isUsed, imageUrl,
  selectLabel, deleteLabel, usageBadge, onSelect, onDelete }: Props) {
  return (
                  <div className={styles.photo}>
                    <button
                      disabled={!selectable}
                      type="button"
                      className={styles.selectButton}
                      data-selected={selected}
                      aria-pressed={selected}
                      aria-label={selectLabel}
                      onClick={onSelect}
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src={imageUrl}
                        alt=""
                        className={styles.image}
                      />
                    </button>

                    {isUsed && <span className={styles.usage}>
                      {usageBadge}
                    </span>}
                    <div className={styles.removeButton}>
                      <Button type="button" variant="outline" size="icon" className={styles.usedRemove}
                        aria-label={deleteLabel} onClick={onDelete}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
  );
}
