import { ConnectionOptions } from 'typeorm';

require('dotenv').config();

type Config = {
  db: ConnectionOptions;
};

const config: Config = {
  db: {
    type: 'mysql',
    url: 'mysql://root:root@localhost/skillfuze-dev',
    database: 'skillfuze-dev',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: [`${__dirname}/../src/api/**/*.entity.{ts,js}`],
  },
};

export default config;
