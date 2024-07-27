const fs = require('fs');
const path = require('path');

const readLogFiles = (logDir) => {
    let logData = {};

    const items = fs.readdirSync(logDir);
    items.forEach(item => {
        const itemPath = path.join(logDir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            const files = fs.readdirSync(itemPath);
            logData[item] = files;
        }
    });

    return logData;
};

const showAllFolderInsideLogs = (req, res) => {
    const logDir = path.join(__dirname, '..', '..', 'logs');
    const folders = fs.readdirSync(logDir).filter(item => fs.statSync(path.join(logDir, item)).isDirectory());
    const folderContents = readLogFiles(logDir);
    const userId = req.user.userId;
    res.render('logs-file', { folders, folderContents, userId: userId });
};

const readFileContents = (req, res) => {
    const { folder, file } = req.query;
    const filePath = path.join(__dirname, '..', '..', 'logs', folder, file);
    const content = fs.readFileSync(filePath, 'utf8');
    res.send(content);
};

module.exports = {
    showAllFolderInsideLogs,
    readFileContents,
    readLogFiles
};
