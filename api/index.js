'use strict';

const Hapi = require('@hapi/hapi');
const db = require('./utils/database');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    // register plugins to server instance
    await server.register([
        {
            plugin: require('@hapi/cookie')
        },
        {
            plugin: require('./plugins/settingCookie')
        },
        {
            plugin: require('./plugins/loadAllRoutes')
        }
    ]);

    await server.start();
    db.sequelize.sync().then(() => {
        console.log('sequelize.sync()');
    });
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();