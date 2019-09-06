const dumpMySQL = require('./dump-mysql');
const CronJob = require('cron').CronJob;


/**
 * mkdir for mysqlInstance/database
 * @param connection
 * @param config
 * @param databaseName
 * @returns {string|null}
 */
function generateDatabaseFolder(connection, config, databaseName) {
  try {
    let instanceDirname = (connection.host ? connection.host : 'localhost') + '_' + (connection.port ? connection.port : '3306');
    instanceDirname = instanceDirname.split(':').join('').split('/').join('');
    return config.folder + '/' + instanceDirname + '/' + databaseName + '/';
  } catch (e) {
    return null;
  }
}

let dumpTasks = (config) => {
  if (!config) {
    return Promise.reject(new Error("Config is null."));
  }

  if (!config.defaultKeep) { // by default, keep 7 dumps
    config.defaultKeep = 7;
  }

  if (!config.folder) { // default
    config.folder = "./dumps"
  }

  // transform config to tasks
  // noinspection JSUnresolvedVariable
  if (config.instances) {
    try {
      let dumpTasks = [];
      config.instances.map(instance => {

        // verify config
        // noinspection JSUnresolvedVariable
        if (instance.user && instance.password && instance.databases) {
          try {
            for (let databaseName in instance.databases) {
              let connection = {
                database: databaseName,
                user: instance.user,
                password: instance.password
              };
              if (instance.host) {
                connection.host = instance.host;
              }
              if (instance.port) {
                connection.port = instance.port;
              }
              if (instance.charset) {
                connection.charset = instance.charset;
              }
              let now = new Date();
              let folder = generateDatabaseFolder(connection, config, databaseName);
              let task = {
                connection: connection,
                keep: config.defaultKeep,
                folder: folder,
                dumpToFile: now.getTime() + ".sql"
              };
              let dumpConfig = instance.databases[databaseName];
              if (dumpConfig) {
                if (dumpConfig.keep) {
                  task.keep = dumpConfig.keep;
                }
              }
              dumpTasks.push(task);
            }
          } catch (e) {
            console.error(e);
          }
        }
      });

      // run task one by one.
      let i = 0;
      let recursive = function (index) {
        return dumpMySQL(dumpTasks[index]).then(() => {
          // handle next

          if (i < dumpTasks.length - 1) {
            i++;
            return recursive(i);
          } else {
            return Promise.resolve('finished');
          }

        }).catch(err => {
          // handle failed, keep running the next.

          console.error(err);
          if (i < dumpTasks.length - 1) {
            i++;
            return recursive(i);
          } else {
            return Promise.resolve('finished');
          }
        })

      };

      // finish
      recursive(i).then(allDone => console.log(allDone));

    } catch (e) {
      return Promise.reject(e);
    }
  } else {
    return Promise.reject(new Error('config.instances not found.'))
  }
};

/**
 * enable cron task
 * @param config
 */
let cronDump = (config) => {
  if (!config) {
    throw new Error("config is null.");
  }

  if (!config.cronTime) {
    throw new Error("config.cronTime is null.");
  }

  if (!config.timezone) {
    config.timezone = "UTC";
  }

  new CronJob(config.cronTime, function () {
    return dumpTasks(config);
  }, null, true, config.timezone);

};

module.exports = {exec: cronDump, dumpTasks: dumpTasks};
