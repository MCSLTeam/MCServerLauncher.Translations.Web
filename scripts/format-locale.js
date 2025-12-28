const fs = require("node:fs");

const paths = ["./locales/"];

for (const path of paths) {
  fs.readdirSync(path).forEach((file) => {
    if (file.endsWith(".json")) {
      const content = fs.readFileSync(path + file, "utf8");
      const json = JSON.parse(content);
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
