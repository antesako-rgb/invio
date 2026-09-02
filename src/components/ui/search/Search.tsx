import {
  Search as SearchIcon,
  X,
} from "lucide-react";

import styles from "./Search.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface SearchProps {
  value:
    string;

  placeholder?:
    string;

  ariaLabel?:
    string;

  disabled?:
    boolean;

  onValueChange: (
    value: string
  ) => void;
}

/* ==========================================================================
   Search
========================================================================== */

export default function Search({
  value,
  placeholder = "Pretraži...",
  ariaLabel = "Pretraži",
  disabled = false,
  onValueChange,
}: SearchProps) {
  const hasValue =
    value.length >
    0;

  return (
    <div
      className={
        styles.search
      }
      data-disabled={
        disabled ||
        undefined
      }
    >
      <SearchIcon
        className={
          styles.icon
        }
        size={18}
        aria-hidden="true"
      />

      <input
        type="search"
        className={
          styles.input
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        aria-label={
          ariaLabel
        }
        disabled={
          disabled
        }
        autoComplete="off"
        onChange={(
          event
        ) =>
          onValueChange(
            event.target.value
          )
        }
      />

      {hasValue &&
        !disabled && (
          <button
            type="button"
            className={
              styles.clear
            }
            aria-label="Očisti pretragu"
            onClick={() =>
              onValueChange(
                ""
              )
            }
          >
            <X
              size={16}
              aria-hidden="true"
            />
          </button>
        )}
    </div>
  );
}