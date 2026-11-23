# Feature Development: Add `LogLevel` Parameter Type to Click

## Repository
`https://github.com/pallets/click` — pinned at tag `v8.1.7` (commit `9b9bfbd`)

## Context
Click provides rich parameter types (`INT`, `FLOAT`, `Choice`, `Path`, `UUID`, etc.) in `src/click/types.py`. Developers who build CLI tools with logging frequently need to accept a log-level string from the user and convert it to Python's `logging` module integer constant. Currently there is no built-in `LogLevel` type; developers must roll their own `Choice` + callback workaround each time.

## Objective
Add a `LogLevel` parameter type to `src/click/types.py` and expose it at the package level so it can be used as:

```python
@click.option("--log-level", type=click.LogLevel(), default="WARNING")
def cli(log_level):
    logging.basicConfig(level=log_level)
```

## Requirements

1. **New class `LogLevelParamType(ParamType)`** in `src/click/types.py`:
   - `name = "LOG_LEVEL"`
   - Accepts (case-insensitive): `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
   - Converts the string to the corresponding `logging` integer constant:
     - `DEBUG` → `10`, `INFO` → `20`, `WARNING` → `30`, `ERROR` → `40`, `CRITICAL` → `50`
   - On invalid input: calls `self.fail(...)` with a helpful message listing valid choices.

2. **Module-level singleton**: Add `LOG_LEVEL = LogLevelParamType()` after the class definition (following the pattern of `STRING`, `INT`, etc.).

3. **Package export**: Add `LogLevel` as an alias in `src/click/__init__.py` and `src/click/types.py` `__all__` so users can call `click.LogLevel()`.

4. **Regression protection**: Must not break any existing Click tests (`pytest tests/`).

## Acceptance Criteria
- `click.LogLevel().convert("DEBUG", None, None)` returns `10`
- `click.LogLevel().convert("warning", None, None)` returns `30` (case-insensitive)
- `click.LogLevel().convert("INVALID", None, None)` raises `click.BadParameter`
- A CLI built with `@click.option("--level", type=click.LogLevel())` correctly sets the log level
- All existing Click tests continue to pass
