const fs = require("node:fs");
const fetch = require("node-fetch");

const paths = ["./eula/"];

for (const path of paths) {
  fs.readdirSync(path).forEach((file) => {
    if (file.endsWith(".json")) {
      (async () => {
        const content = fs.readFileSync(path + file, "utf8");
        const json = JSON.parse(content);
        const eula = await (await fetch(json.mirror)).text();
        const result =
          JSON.stringify(
            {
              ...json,
              content: await eula,
            },
            null,
            4,
          ) + "\n";
        const changed = content !== result;
        if (changed) fs.writeFileSync(path + file, result);
        console.log(
          `Updated eula: ${path + file}${changed ? "" : " (unchanged)"}`,
        );
      })();
    }
  });
}
