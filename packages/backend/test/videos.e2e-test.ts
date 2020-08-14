import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../src/api/videos/video.entity';
import { UserRepository } from '../src/api/users/user.repository';
import { AuthService } from '../src/api/auth/services/auth.service';
import { User } from '../src/api/users/user.entity';
import { VideosRepository } from '../src/api/videos/videos.repository';
import { UserService } from '../src/api/users/user.service';
import { AuthModule } from '../src/api/auth/auth.module';
import { VideosModule } from '../src/api/videos/videos.module';
import { ormConfig } from './config';
import { CategoriesRepository } from '../src/api/categories/categories.repository';
import { CategoriesModule } from '../src/api/categories/categories.module';

describe('Videos (e2e)', () => {
  let videoRepository: VideosRepository;
  const url = '/api/v1/videos';
  let app: INestApplication;
  let module: TestingModule;
  let categoriesRepo: CategoriesRepository;
  let token: string;
  let user: User;
  let userService: UserService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormConfig), AuthModule, VideosModule, CategoriesModule],
    }).compile();

    const payload = {
      firstName: 'Khaled',
      lastName: 'Mohamed',
      email: 'khaled123@skillfuze.com',
      password: '123456789',
      confirmPassword: '123456789',
    };
    videoRepository = module.get<VideosRepository>(VideosRepository);
    userService = module.get<UserService>(UserService);
    user = await userService.register(payload);
    const authService = module.get<AuthService>(AuthService);
    token = `Bearer ${authService.generateToken(user)}`;

    categoriesRepo = module.get(CategoriesRepository);
    await categoriesRepo.save({ id: 1, name: 'Test' });

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  describe('POST /api/v1/videos', () => {
    const payload = {
      title: 'Video Title',
      url: 'http://a.com',
      category: { id: 1 },
    };

    it('should create video successfully', async () => {
      const res = await request(app.getHttpServer()).post(url).send(payload).set('Authorization', token).expect(201);

      expect(res.body.id).not.toBe(undefined);

      const video = await videoRepository.findOne(res.body.id);
      expect(res.body.id).toBe(video.id);
    });

    it('should return BadRequest on empty title', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ ...payload, title: undefined })
        .set('Authorization', token)
        .expect(400);
    });

    it('should return Unauthorized on invalid token', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ ...payload, title: undefined })
        .set('Authorization', '')
        .expect(401);
    });
  });

  describe('GET /api/v1/videos/:id', () => {
    let video: Video;

    beforeEach(async () => {
      const payload = {
        title: 'Video Title',
        url: 'http://a.com',
        category: { id: 1 },
      };

      const res = await request(app.getHttpServer()).post(url).send(payload).set('Authorization', token);

      video = res.body;
    });

    it('should get video successfully on valid id', async () => {
      const { body } = await request(app.getHttpServer()).get(`${url}/${video.id}`).expect(200);

      expect(body.id).toBe(video.id);
      expect(body.uploader.id).toBe(user.id);
    });

    it('should return 404 on invalid id', async () => {
      await request(app.getHttpServer()).get(`${url}/invalid-id`).expect(404);
    });
  });

  describe('DELETE /api/v1/videos/:id', () => {
    let video: Video;
    let newToken: string;

    beforeAll(async () => {
      const payload = {
        firstName: 'Karim',
        lastName: 'Elsayed',
        email: 'Karim@skillfuze.com',
        password: '123456789',
        confirmPassword: '123456789',
      };
      const newUser = await userService.register(payload);
      const authService = module.get<AuthService>(AuthService);
      newToken = `Bearer ${authService.generateToken(newUser)}`;
    });

    beforeEach(async () => {
      const payload = {
        title: 'Video Title',
        url: 'http://a.com',
        category: { id: 1 },
      };
      const res = await request(app.getHttpServer()).post(url).send(payload).set('Authorization', token);

      video = res.body;
    });

    it('should delete video successfully on valid data', async () => {
      await request(app.getHttpServer()).delete(`${url}/${video.id}`).set('Authorization', token).expect(200);
    });

    it('should return Unauthorized on invalid token', async () => {
      await request(app.getHttpServer()).delete(`${url}/${video.id}`).set('Authorization', '').expect(401);
    });

    it('should return 403 when token.Id doesnot match the uploader.Id', async () => {
      await request(app.getHttpServer()).delete(`${url}/${video.id}`).set('Authorization', newToken).expect(403);
    });

    it('should return 404 on invalid id', async () => {
      await request(app.getHttpServer()).delete(`${url}/invalid-id`).set('Authorization', token).expect(404);
    });
  });

  describe('PATCH /api/v1/videos/:id', () => {
    let video: Video;
    let newToken: string;
    const updatePayload = {
      title: 'Video Title',
      category: { id: 1 },
    };

    beforeAll(async () => {
      const payload = {
        firstName: 'Mariam',
        lastName: 'Kamel',
        email: 'MariamKamel@skillfuze.com',
        password: '123456789',
        confirmPassword: '123456789',
      };
      const newUser = await userService.register(payload);
      const authService = module.get<AuthService>(AuthService);
      newToken = `Bearer ${authService.generateToken(newUser)}`;
    });

    beforeEach(async () => {
      const payload = {
        title: 'Video Title',
        url: 'http://a.com',
        category: { id: 1 },
      };
      const res = await request(app.getHttpServer()).post(url).send(payload).set('Authorization', token);

      video = res.body;
    });

    it('should update video successfully on valid data', async () => {
      const { body } = await request(app.getHttpServer())
        .patch(`${url}/${video.id}`)
        .send(updatePayload)
        .set('Authorization', token)
        .expect(200);

      expect(body.id).toBe(video.id);
      expect(body.title).toBe(updatePayload.title);
      expect(body.uploader.id).toBe(user.id);
    });

    it('should return 400 on invalid data', async () => {
      await request(app.getHttpServer())
        .patch(`${url}/${video.id}`)
        .send({ ...updatePayload, title: '' })
        .set('Authorization', token)
        .expect(400);
    });

    it('should return Unauthorized on invalid token', async () => {
      await request(app.getHttpServer())
        .patch(`${url}/${video.id}`)
        .send(updatePayload)
        .set('Authorization', '')
        .expect(401);
    });

    it('should return 403 when uplaoder isnot the editor', async () => {
      await request(app.getHttpServer())
        .patch(`${url}/${video.id}`)
        .send(updatePayload)
        .set('Authorization', newToken)
        .expect(403);
    });

    it('should return 404 on invalid id', async () => {
      await request(app.getHttpServer())
        .patch(`${url}/invalid-id`)
        .send(updatePayload)
        .set('Authorization', token)
        .expect(404);
    });
  });

  describe('POST /api/v1/videos/:id/view', () => {
    let video: Video;

    beforeEach(async () => {
      const payload = {
        title: 'Video Title',
        url: 'http://a.com',
        category: { id: 1 },
      };
      const res = await request(app.getHttpServer()).post(url).send(payload).set('Authorization', token);

      video = res.body;
    });

    it('should return 429 on second request with same video id', async () => {
      await request(app.getHttpServer()).post(`${url}/${video.id}/view`);

      await request(app.getHttpServer()).post(`${url}/${video.id}/view`).expect(429);
    });

    it('should return 404 on invalid id', async () => {
      await request(app.getHttpServer()).post(`${url}/invalid-id/view`).expect(404);
    });
  });

  describe('GET /api/v1/videos', () => {
    it('should get the All videos and their count successfully', async () => {
      const res = await request(app.getHttpServer()).get(`${url}`).send().expect(200);

      expect(res.body.data.length).toBe(0);
      expect(res.body.count).toBe(0);
    });
  });

  afterEach(async () => {
    await videoRepository.delete({});
  });

  afterAll(async () => {
    const userRepo = module.get<UserRepository>(UserRepository);
    await userRepo.delete({});
    await categoriesRepo.delete({});
    await app.close();
  });
});
