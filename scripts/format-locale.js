const fs = require("node:fs");

const paths = ["./eula/", "./locales/"];

function getAllKeys(obj, prefix = "") {
  const keys = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      keys.push(fullPath);
      if (typeof obj[key] === "object" && obj[key] !== null) {
        keys.push(...getAllKeys(obj[key], fullPath));
      }
    }
  }
  return keys;
}

function filterObject(obj, referenceObj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const filteredObj = {};
  for (const key in referenceObj) {
    if (referenceObj.hasOwnProperty(key) && obj.hasOwnProperty(key)) {
      if (typeof referenceObj[key] === "object" && referenceObj[key] !== null) {
        filteredObj[key] = filterObject(obj[key], referenceObj[key]);
      } else {
        filteredObj[key] = obj[key];
      }
    }
  }
  return filteredObj;
}

for (const path of paths) {
  // 首先读取 zh-CN.json 文件作为参考
  let zhCNContent = null;
  let zhCNJson = null;
  try {
    zhCNContent = fs.readFileSync(path + "zh-CN.json", "utf8");
    zhCNJson = JSON.parse(zhCNContent);
  } catch (error) {
    console.error(`Error reading zh-CN.json in ${path}:`, error.message);
    continue;
  }

  fs.readdirSync(path).forEach((file) => {
    if (file.endsWith(".json")) {
      const content = fs.readFileSync(path + file, "utf8");
      let json = JSON.parse(content);

      // 对于非 zh-CN.json 文件，过滤掉 zh-CN.json 中不存在的键
      if (file !== "zh-CN.json") {
        json = filterObject(json, zhCNJson);
      }

      const result =
        JSON.stringify(
          json,
          (key, value) => {
            if (typeof value === "object" && value !== null) {
              const sortedObj = {};
              Object.keys(value)
                .sort()
                .forEach((key) => {
                  sortedObj[key] = value[key];
                });
              return sortedObj;
            }
            return value;
          },
          4,
        ) + "\n";
      const changed = content !== result;
      if (changed) fs.writeFileSync(path + file, result);
      console.log(
        `Formatted locale: ${path + file}${changed ? "" : " (unchanged)"}`,
      );
    }
  });
}
