import axios from 'axios';
import { Video, CreateVideoDTO, UpdateVideoDTO } from '@skillfuze/types';

import { parseError } from '../utils/parseError';

export class VideosService {
  public static async create(uploadedVideo: CreateVideoDTO): Promise<Video> {
    try {
      const { data: video } = await axios.post<Video>('api/v1/videos', uploadedVideo);
      return video;
    } catch (error) {
      throw parseError(error.response.data);
    }
  }

  public static async getOne(id: string): Promise<Video> {
    const { data: video } = await axios.get<Video>(`api/v1/videos/${id}`);
    return video;
  }

  public static async delete(id: string): Promise<void> {
    try {
      await axios.delete(`api/v1/videos/${id}`);
    } catch (error) {
      throw parseError(error.response.data);
    }
  }

  public static async update(id: string, updatedVideo: UpdateVideoDTO): Promise<Video> {
    try {
      const { data: video } = await axios.patch<Video>(`api/v1/videos/${id}`, updatedVideo);
      return video;
    } catch (error) {
      throw parseError(error.response.data);
    }
  }

  public static async addView(id: string): Promise<void> {
    try {
      await axios.post<Video>(`api/v1/videos/${id}/view`);
    } catch (error) {
      throw parseError(error.response.data);
    }
  }
}
