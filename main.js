const { app, BrowserWindow } = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    // Other window options
  });
  win.maximize()
  win.loadFile('dist/modernize/index.html'); // Path to your Angular's index.html in the 'dist' folder after building
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});


//HOW TO BUILD AN ELECTRON PROJECT
//install electron
//create main js file
//Modify your package.json, add main js, electron, electron-build
// npm run electron
// npm run electron-build
//install electron packager for deployment
//electron-packager . --platform=win32 --overwrite

