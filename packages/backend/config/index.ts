import { JwtModuleOptions } from '@nestjs/jwt';
import { ConnectionOptions } from 'typeorm';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { winstonOptions as winston } from './winston.config';

require('dotenv').config();

type Config = {
  db: ConnectionOptions;
  jwt: JwtModuleOptions;
  corsOptions: CorsOptions;
  gatsby: {
    buildHookURL: string;
  };
  winston: typeof winston;
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
  jwt: {
    secret: process.env.JWT_SECRET || 'skillFuze',
    signOptions: { expiresIn: '86400s' },
  },
  corsOptions: {
    origin: ['http://localhost:3001'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
  gatsby: {
    buildHookURL: process.env.GATSBY_BUILD_HOOK_URL,
  },
  winston,
};

export default config;
