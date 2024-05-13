module.exports = function ( shipit ) {
  require('./deploy')(shipit);

  shipit.initConfig({
    default: {
      workspace: './build',
      deployTo: '/var/www/soapee/',
      rsync: ['--del'],
      keepReleases: 3,
      deleteOnRollback: false
    },

    production: {
      servers: [{
        host: 'soapee.com',
        user: 'soapee'
      }],
      key: './keys/production'
    }
  });
};
