import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserService } from '../src/api/users/user.service';
import { UserRepository } from '../src/api/users/user.repository';
import { AuthModule } from '../src/api/auth/auth.module';

describe('AuthController (e2e)', () => {
  let moduleFixture: TestingModule;
  let app: INestApplication;
  const ormConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    url: 'mysql://root:root@localhost/skillfuze-test',
    database: 'skillfuze-test',
    synchronize: true,
    logging: false,
    entities: [`${__dirname}/../src/api/**/*.entity.{ts,js}`],
  };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormConfig), AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  describe('POST /api/v1/auth/register', () => {
    const url = '/api/v1/auth/register';
    let userService: UserService;
    const payload = {
      firstName: 'Khaled',
      lastName: 'Mohamed',
      email: 'khaled@skillfuze.com',
      password: '123456789',
      confirmPassword: '123456789',
    };

    beforeAll(() => {
      userService = moduleFixture.get<UserService>(UserService);
    });

    it('should register the user and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send(payload);

      expect(res.status).toBe(201);

      const user = await userService.findByEmail(payload.email);
      expect(user).not.toBe(undefined);
    });

    it('should return 400 on empty values', async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send({ ...payload, firstName: '' });

      expect(res.status).toBe(400);
    });

    it('should return 400 on duplicate emails', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send(payload);

      const res = await request(app.getHttpServer())
        .post(url)
        .send(payload);

      expect(res.status).toBe(400);
    });
  });

  afterEach(async () => {
    const userRepo = moduleFixture.get<UserRepository>(UserRepository);
    await userRepo.clear();
  });

  afterAll(async () => {
    await app.close();
  });
});
