const path = require('path');

const _ = require('lodash');
const utils = require('shipit-utils');
const moment = require('moment');
const chalk = require('chalk');
const Bluebird = require('bluebird');

/**
 * Update task.
 * - Set previous release.
 * - Set previous revision.
 * - Create and define release path.
 * - Set current revision and write REVISION file.
 * - Remote copy project.
 */

module.exports = function (gruntOrShipit) {
    utils.registerTask(gruntOrShipit, 'deploy:update-local', task);

    function task() {
      const shipit = utils.getShipit(gruntOrShipit);

        _.assign(shipit.constructor.prototype, require('shipit-deploy/lib/shipit'));

        return setPreviousRelease()
            .then(setPreviousRevision)
            .then(createReleasePath)
            .then(remoteCopy)
            .then(() => shipit.emit('updated'));


        function createReleasePath() {
            shipit.releaseDirname = moment.utc().format('YYYYMMDDHHmmss');
            shipit.releasePath = path.join(shipit.releasesPath, shipit.releaseDirname);

            shipit.log('Create release path "%s"', shipit.releasePath);

            return shipit.remote('mkdir -p ' + shipit.releasePath)
                .then(() => shipit.log(chalk.green('Release path created.')));
        }

        /**
         * Remote copy project.
         */

        function remoteCopy() {
          const uploadDirPath = path.resolve(shipit.config.workspace, shipit.config.dirToCopy || '');

            shipit.log('Copy project to remote servers.');

            return shipit.remoteCopy(uploadDirPath + '/', shipit.releasePath, {rsync: '--del'})
                .then(() => shipit.log(chalk.green('Finished copy.')));
        }

        /**
         * Set shipit.previousRevision from remote REVISION file.
         */

        function setPreviousRevision() {
            shipit.previousRevision = null;

            if (!shipit.previousRelease) {
                return Bluebird.resolve();
            }

            return shipit.getRevision(shipit.previousRelease)
                .then((revision) => {

                    if (revision) {
                        shipit.log(chalk.green('Previous revision found.'));
                        shipit.previousRevision = revision;
                    }
                });
        }

        /**
         * Set shipit.previousRelease.
         */

        function setPreviousRelease() {
            shipit.previousRelease = null;

            return shipit.getCurrentReleaseDirname()
                .then((currentReleasseDirname) => {
                    if (currentReleasseDirname) {
                        shipit.log(chalk.green('Previous release found.'));
                        shipit.previousRelease = currentReleasseDirname;
                    }
                });
        }

    }
};
