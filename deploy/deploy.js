const utils = require( 'shipit-utils' );
const Bluebird = require('bluebird');


module.exports = function ( gruntOrShipit ) {
    const shipit = utils.getShipit( gruntOrShipit );

    require( 'shipit-deploy' )( shipit );
    require( './update' )( shipit );

    utils.registerTask( shipit, 'link:folders', function () {

        async function linkLogs() {
            await shipit.remote(
                'mkdir -p /var/www/soapee/shared/logs'
            );

            await shipit.remote(
                'ln -s /var/www/soapee/shared/logs ' + shipit.releasePath + '/api/logs'
            );
        }

        return linkLogs();

    } );

    utils.registerTask( shipit, 'yarn:install', async function () {
        await shipit.remote(
          `cd ${shipit.releasePath}/api && yarn --frozen-lockfile --production`
        );
    } );

    utils.registerTask( shipit, 'reload:soapee', async function () {
        await shipit.remote('mkdir -p ' + shipit.releasePath + '/api/tmp');
        await shipit.remote('touch ' + shipit.releasePath + '/api/tmp/restart.txt');
        await Bluebird.delay(2000);
        // cold start passenger process
        await shipit.remote(`curl --location --request POST 'http://soapee.com/api/graphql' --header 'Content-Type: application/json' --data-raw '{"query":"{ recipe(id: 1) { id } }"}'`);
    } );

    utils.registerTask( shipit, 'deploy-local', [
        'deploy:init',
        'deploy:update-local',
        'yarn:install',
        'link:folders',
        'deploy:publish',
        'deploy:clean',
        'reload:soapee'
    ] );
};
