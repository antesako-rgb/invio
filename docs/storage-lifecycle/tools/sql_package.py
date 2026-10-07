"""Read local canonical SQL; no database access."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parent.parent

def statements(source):
    """Split the package's SQL without splitting quoted function bodies."""
    start = index = 0
    quote = None
    line_comment = False
    block_depth = 0
    while index < len(source):
        if line_comment:
            if source[index] == "\n":
                line_comment = False
            index += 1
            continue
        if block_depth:
            if source.startswith("/*", index):
                block_depth += 1
                index += 2
            elif source.startswith("*/", index):
                block_depth -= 1
                index += 2
            else:
                index += 1
            continue
        if quote:
            if source.startswith(quote, index):
                index += len(quote)
                if quote in ("'", '"') and source.startswith(quote, index):
                    index += 1
                else:
                    quote = None
            else:
                index += 1
            continue
        if source.startswith("--", index):
            line_comment = True
            index += 2
        elif source.startswith("/*", index):
            block_depth = 1
            index += 2
        elif source[index] in ("'", '"'):
            quote = source[index]
            index += 1
        elif source[index] == "$" and (match := re.match(r"\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$", source[index:])):
            quote = match.group()
            index += len(quote)
        elif source[index] == ";":
            statement = source[start:index + 1]
            # Strip only leading comments/whitespace, never function-body text.
            statement = re.sub(r"\A(?:\s+|--[^\n]*(?:\n|$)|/\*.*?\*/)*", "", statement, flags=re.S)
            if statement:
                yield statement.strip()
            start = index = index + 1
        else:
            index += 1
    tail = re.sub(r"\A(?:\s+|--[^\n]*(?:\n|$)|/\*.*?\*/)*", "", source[start:], flags=re.S)
    if tail.strip() or quote or block_depth:
        raise ValueError("Unterminated SQL; refusing to generate references")

