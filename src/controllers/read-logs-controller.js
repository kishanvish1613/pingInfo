const fs = require('fs');
const path = require('path');

// Function to read and parse log files from all subdirectories
function readLogFiles(logDir) {
  const pingData = {};

  // Recursively read log files from subdirectories
  function readLogsFromDirectory(directory) {
    const items = fs.readdirSync(directory);

    items.forEach(item => {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // If item is a directory, read its contents
        readLogsFromDirectory(itemPath);
      } else if (stat.isFile()) {
        // If item is a file, read its content
        const data = fs.readFileSync(itemPath, 'utf-8');
        const lines = data.split('\n');

        lines.forEach(line => {
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
    const logsDir = path.join(__dirname, '../../logs');

    fs.readdir(logsDir, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading logs directory:', err);
            return res.status(500).send('Server error');
        }

        const folders = files
            .filter(file => file.isDirectory())
            .map(dir => dir.name);

        res.render('logs-file', { folders, parentDir: '' });
    });
};

const showFolderContents = (req, res) => {
    const folderPath = path.join(__dirname, '../../logs', req.params.folder);

    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return res.status(500).send('Server error');
        }

        const contents = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory()
        }));

        res.render('folder-contents', { contents, parentDir: req.params.folder });
    });
};

const readFileContents = (req, res) => {
    const filePath = path.join(__dirname, '../../logs', req.params.folder, req.params.file);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Server error');
        }

        res.render('file-contents', { fileName: req.params.file, fileContents: data, parentDir: req.params.folder });
    });
};


module.exports = {
    readLogFiles,
    showAllFolderInsideLogs,
    showFolderContents,
    readFileContents
};
