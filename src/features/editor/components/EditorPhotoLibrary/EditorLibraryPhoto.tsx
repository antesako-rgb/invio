"use client";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./EditorPhotoLibrary.module.css";

interface Props {
  descriptionControl?: ReactNode;
  disabled?: boolean;
  deleteDisabled?: boolean;
  selectable: boolean;
  selected: boolean;
  isUsed: boolean;
  imageUrl: string;
  selectLabel: string;
  deleteLabel: string;
  usageBadge: string;
  onSelect: () => void;
  onDelete?: () => void;
}

// Sibling controls: only the explicit trash button owns delete intent.
export default function EditorLibraryPhoto({ selectable, selected, isUsed, imageUrl,
  selectLabel, deleteLabel, usageBadge, onSelect, onDelete, disabled = false, deleteDisabled = false, descriptionControl }: Props) {
  return (
                  <div className={styles.photo}>
                    <button
                      disabled={disabled || !selectable}
                      type="button"
                      className={styles.selectButton}
                      data-selected={selected}
                      aria-pressed={selected}
                      aria-label={selectLabel}
                      onClick={onSelect}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    {descriptionControl && <div className={styles.editButton}>{descriptionControl}</div>}
                    {onDelete && <div className={styles.removeButton}>
                      <Button type="button" variant="outline" size="icon" className={styles.usedRemove}
                        disabled={disabled || deleteDisabled} title={deleteLabel} aria-label={deleteLabel} onClick={onDelete}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>}
                  </div>
  );
}
