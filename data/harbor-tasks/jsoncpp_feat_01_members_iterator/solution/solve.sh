#!/usr/bin/env bash
# Oracle reference solution: Add members() to Json::Value
set -e

HEADER="/app/include/json/value.h"
IMPL="/app/src/lib_json/json_value.cpp"

# --- Inject MemberRange helpers into header ---
python3 - << 'PYEOF'
import pathlib

header = pathlib.Path("/app/include/json/value.h").read_text()

members_code = '''
  // --- members() range-for support ---
  struct MemberIterator {
    ValueIterator it_;
    std::pair<std::string, Value&> operator*() const {
      return {it_.name(), *it_};
    }
    MemberIterator& operator++() { ++it_; return *this; }
    bool operator!=(const MemberIterator& o) const { return it_ != o.it_; }
  };
  struct MemberRange {
    Value& val_;
    MemberIterator begin() { return {val_.begin()}; }
    MemberIterator end()   { return {val_.end()};   }
  };
  /// Returns a proxy for range-based for loops over object members.
  /// Yields std::pair<std::string, Value&> for each key-value pair.
  /// For non-object Values, returns an empty range.
  MemberRange members() { return {*this}; }
'''

# Insert before the closing brace of the Value class (before "};")
marker = "private:  // not implemented and explicitly deleted\n"
idx = header.find(marker)
if idx == -1:
    marker = "private:"
    idx = header.rfind(marker)
if "members()" not in header:
    header = header[:idx] + members_code + "\n" + header[idx:]
    pathlib.Path("/app/include/json/value.h").write_text(header)
    print("members() injected into value.h")
else:
    print("members() already present.")
PYEOF

# Rebuild
cmake --build /app/build --target jsoncpp_lib 2>&1 | tail -5

echo "Reference solution applied."
