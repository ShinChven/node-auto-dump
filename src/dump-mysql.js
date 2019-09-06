const mysqldump = require('mysqldump');
const fs = require('fs-extra');

/**
 * dump one task
 * @param dumpConfig dump config
 * @returns Promise
 */
let dumpMySQL = (dumpConfig) => {
  if (!dumpConfig.folder) {
    return Promise.reject(new Error('folder not exist'));
  }

  // mkdir here
  // noinspection JSUnresolvedFunction
  return fs.ensureDir(dumpConfig.folder).then(() => {
    console.log(dumpConfig.folder);

    // dump
    return mysqldump({
      connection: dumpConfig.connection,
      dumpToFile: dumpConfig.folder + dumpConfig.dumpToFile,
    }).then(() => {

      // remove old files
      // noinspection JSUnresolvedFunction
      return fs.readdir(dumpConfig.folder).then(items => {

        // collect mysql files
        let files = [];
        items.map(item => {
          let file = dumpConfig.folder + item;
          files.push(file);
        });

        // sort by create datetime
        files.sort(function (a, b) {
          // noinspection JSUnresolvedFunction
          return fs.statSync(b).mtime.getTime() -
            fs.statSync(a).mtime.getTime();
        });

        // filter old files
        for (let i = 0; i < files.length; i++) {
          let filepath = files[i];
          // noinspection JSUnresolvedFunction
          let ctime = fs.statSync(filepath).ctime;
          console.log(filepath + " " + ctime.toTimeString()+" "+ctime.toDateString());
        }

        // remove old files
        for (let i = dumpConfig.keep; i < files.length; i++) {
          // noinspection JSUnresolvedFunction
          fs.removeSync(files[i]);
        }
        return Promise.resolve();
      })
    });
  }).catch(err => {
    console.error(err);
    return Promise.reject(err);
  })


};

module.exports = dumpMySQL;
