// Feature test: Json::Value::members() range-for iterator
#include <json/json.h>
#include <cassert>
#include <iostream>
#include <map>
#include <string>

int passed = 0;
int failed = 0;

#define ASSERT_TRUE(cond, msg) \
  do { \
    if (!(cond)) { std::cerr << "FAIL: " << msg << "\n"; ++failed; } \
    else { std::cout << "PASS: " << msg << "\n"; ++passed; } \
  } while(0)

int main() {
  // Build a JSON object
  Json::Value root;
  root["alpha"] = 1;
  root["beta"] = 2;
  root["gamma"] = 3;

  // Test 1: members() compiles and iterates
  std::map<std::string, int> collected;
  for (auto& [key, val] : root.members()) {
    collected[key] = val.asInt();
  }
  ASSERT_TRUE(collected.size() == 3, "members() yields 3 entries");
  ASSERT_TRUE(collected["alpha"] == 1, "alpha == 1");
  ASSERT_TRUE(collected["beta"]  == 2, "beta == 2");
  ASSERT_TRUE(collected["gamma"] == 3, "gamma == 3");

  // Test 2: iteration order matches getMemberNames()
  auto names = root.getMemberNames();
  std::vector<std::string> iterated_keys;
  for (auto& [key, val] : root.members()) {
    iterated_keys.push_back(key);
  }
  ASSERT_TRUE(iterated_keys == names, "members() order matches getMemberNames()");

  // Test 3: empty object produces empty range
  Json::Value empty(Json::objectValue);
  int count = 0;
  for (auto& [k, v] : empty.members()) { ++count; }
  ASSERT_TRUE(count == 0, "empty object members() is empty");

  // Test 4: non-object value produces empty range (no crash)
  Json::Value arr(Json::arrayValue);
  arr.append(42);
  int arr_count = 0;
  for (auto& [k, v] : arr.members()) { ++arr_count; }
  ASSERT_TRUE(arr_count == 0, "array.members() is empty range");

  std::cout << "\n" << passed << " passed, " << failed << " failed.\n";
  return failed == 0 ? 0 : 1;
}
