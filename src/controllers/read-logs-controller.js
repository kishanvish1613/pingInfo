const fs = require("fs");
const path = require("path");

// Function to read and parse log files from all subdirectories
function readLogFiles(logDir) {
  const pingData = {};

  // Recursively read log files from subdirectories
  function readLogsFromDirectory(directory) {
    const items = fs.readdirSync(directory);
    items.forEach((item) => {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // If item is a directory, read its contents
        readLogsFromDirectory(itemPath);
      } else if (stat.isFile()) {
        // If item is a file, read its content
        const data = fs.readFileSync(itemPath, "utf-8");
        const lines = data.split("\n");

        lines.forEach((line) => {
          const hostMatch = line.match(/Host: ([^ ]+)/);
          const timeMatch = line.match(/Time: (\d+)ms/);
          const unreachableMatch = line.match(/Unreachable/);
          if (hostMatch) {
            const host = hostMatch[1];
            if (!pingData[host]) {
              pingData[host] = [];
            }
            if (timeMatch) {
              pingData[host].push(parseInt(timeMatch[1]));
            } else if (unreachableMatch) {
              pingData[host].push(null); // Use null for unreachable hosts
            }
          }
        });
      }
    });
  }

  readLogsFromDirectory(logDir);
  return pingData;
}

const showAllFolderInsideLogs = (req, res) => {
  const logsDir = path.join(__dirname, "../../logs");
  const userId = req.user.userId;

  fs.readdir(logsDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error("Error reading logs directory:", err);
      return res.status(500).send("Server error");
    }

    const folders = files
      .filter((file) => file.isDirectory())
      .map((dir) => dir.name);

    const folderContents = {};

    // Read each folder's contents
    folders.forEach((folder) => {
      const folderPath = path.join(logsDir, folder);
      folderContents[folder] = fs.readdirSync(folderPath);
    });

    res.render("logs-file", { folders, folderContents, userId, parentDir: "" });
  });
};

const readFileContents = (req, res) => {
  const { folder, file } = req.query;
  const filePath = path.join(__dirname, "../../logs", folder, file);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Server error");
    }

    res.send(data);
  });
};


module.exports = {
  readLogFiles,
  showAllFolderInsideLogs,
  readFileContents,
};
