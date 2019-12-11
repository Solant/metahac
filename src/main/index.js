const { app, BrowserWindow, ipcMain, shell } = require('electron'); // eslint-disable-line
const { join } = require('path');
const { writeFile } = require('fs');
const fetch = require('node-fetch');
const AdmZip = require('adm-zip');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080'
    : `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1000,
        // Allow cross-site requests
        webPreferences: {
            webSecurity: false,
        },
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Allow certificate errors for HAC requests
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
});

ipcMain.on('LOG_ZIP_DOWNLOADED', (event, { url, headers }) => {
    const filePath = join(app.getPath('temp'), 'logs.zip');
    const specificLogPath = join(app.getPath('temp'), 'hybris-log-file');

    fetch(url, {
        headers,
    })
        .then(res => res.buffer())
        .then((buffer) => {
            writeFile(filePath, buffer, () => {
                const zip = new AdmZip(filePath);
                const entries = zip.getEntries();
                const selectedEntry = entries.find(e => e.entryName.startsWith('logs/tomcat'));

                zip.extractEntryTo(selectedEntry, specificLogPath, false, true);
                shell.openItem(join(specificLogPath, selectedEntry.name));
            });
        });
});
