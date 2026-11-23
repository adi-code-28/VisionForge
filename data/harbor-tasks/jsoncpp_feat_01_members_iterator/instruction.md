# Feature Development: Add `members()` Range-For Iterator to JsonCpp

## Repository
`https://github.com/open-source-parsers/jsoncpp` — pinned at tag `1.9.5` (commit `69098a1`)

## Context
JsonCpp's `Json::Value` class supports object iteration through `begin()` / `end()` iterators and `getMemberNames()`. However, iterating over both keys and values simultaneously requires verbose index-based loops or `getMemberNames()` + lookup. Modern C++ (11+) range-based `for` loops work on `begin()`/`end()` pairs but only expose the `Value` — not the key name alongside it.

This task adds a `.members()` adapter method that returns a lightweight proxy object whose iterators yield `std::pair<std::string, Json::Value&>` — enabling idiomatic range-for loops over object members:

```cpp
for (auto& [key, val] : root.members()) {
    std::cout << key << ": " << val << "\n";
}
```

## Requirements

1. **`MemberIterator` proxy class** (in `include/json/value.h` and `src/lib_json/json_value.cpp`):
   - `Value::members()` returns a `MemberRange` proxy.
   - `MemberRange::begin()` / `end()` yield `MemberIterator`.
   - Dereferencing `MemberIterator` returns `std::pair<std::string, Value&>`.

2. **Only for object-type Values**: If called on a non-object `Value`, `members()` behaves like iterating over an empty range (or throws `LogicError` — your choice, document it).

3. **Header-only or implementation split**: Either approach is acceptable; keep changes within `include/json/value.h` and optionally `src/lib_json/json_value.cpp`.

4. **Regression protection**: All existing JsonCpp tests must pass (`cmake --build . && ctest`).

## Acceptance Criteria
- Range-for over `root.members()` yields `(key, value)` pairs for all members of a JSON object.
- Iteration order matches `getMemberNames()`.
- Calling `members()` on a non-object value does not crash (empty range or documented exception).
- All existing JsonCpp ctest suite tests pass.
