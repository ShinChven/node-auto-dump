const fs = require('fs-extra');
const cronDump = require('./src');
fs.readJSON("./config/config.json", "utf-8")
    .then(config => {
        cronDump.exec(config);
    })
    .catch(err => console.error(err));