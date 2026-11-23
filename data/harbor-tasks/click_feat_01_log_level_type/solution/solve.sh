#!/usr/bin/env bash
# Oracle reference solution: Add LogLevel param type to click
set -e

cat >> /app/src/click/types.py << 'PYEOF'

import logging as _logging

class LogLevelParamType(ParamType):
    """A Click parameter type that accepts Python log-level names and converts
    them to their integer equivalents (e.g. ``DEBUG`` → 10)."""

    name = "LOG_LEVEL"

    _LEVELS = {
        "DEBUG": _logging.DEBUG,
        "INFO": _logging.INFO,
        "WARNING": _logging.WARNING,
        "ERROR": _logging.ERROR,
        "CRITICAL": _logging.CRITICAL,
    }

    def convert(self, value, param, ctx):
        if isinstance(value, int):
            return value
        upper = value.upper()
        if upper not in self._LEVELS:
            self.fail(
                f"{value!r} is not a valid log level. Choose from: "
                + ", ".join(self._LEVELS),
                param,
                ctx,
            )
        return self._LEVELS[upper]

    def __repr__(self) -> str:
        return "LOG_LEVEL"


LOG_LEVEL = LogLevelParamType()
PYEOF

# Expose LogLevel at the click package level
python3 - << 'PYEOF'
import re, pathlib

init = pathlib.Path("/app/src/click/__init__.py").read_text()

# Add import line after the last 'from .types import' line
import_line = "from .types import LogLevelParamType as LogLevel\n"
if "LogLevel" not in init:
    # Insert after the last 'from .types' occurrence
    idx = init.rfind("from .types import")
    end = init.index("\n", idx) + 1
    init = init[:end] + import_line + init[end:]
    pathlib.Path("/app/src/click/__init__.py").write_text(init)
    print("LogLevel exported from click package.")
else:
    print("LogLevel already exported.")
PYEOF

echo "Reference solution applied."
