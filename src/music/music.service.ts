import { Injectable } from '@nestjs/common';
import { AudioReleaseDto, UserIdDto, AudioByIdDto } from './dto';
import { User } from './user.type';
import { AwsService } from '../aws/aws.service';
import { PrismaService } from '../prisma/prisma.service';
import { MusicReleaseService } from '../mail/musicRelease.service';
import { NotificationService } from '../mail/notification.service';

@Injectable()
export class MusicService {
  constructor(
    private awsService: AwsService,
    private prismaService: PrismaService,
    private musicReleaseService: MusicReleaseService,
    private notificationService: NotificationService,
  ) {}
  async createAudioRelease(dto: AudioReleaseDto) {
    // strip off space in string
    const user = dto.user as User;
    const imageFileName = dto.imageFileName.split(' ').join('');
    const audioFileName = dto.audioFileName.split(' ').join('');

    const image = await this.awsService.uploadImageToS3(
      user.email,
      imageFileName,
      dto.releaseCover,
    );

    let audio: string | null = null;

    if (dto.releaseAudio) {
      audio = await this.awsService.uploadAudioToS3(
        user.email,
        audioFileName,
        dto.releaseAudio,
      );
    }

    delete dto.imageFileName;
    delete dto.audioFileName;
    delete dto.user;

    const audioRelease = await this.prismaService.audio.create({
      data: {
        ...dto,
        userId: user.id,
        releaseDate: dto.releaseDate,
        releaseCover: image,
        releaseAudio: audio,
        status: 'pending',
        releaseType: 'audio',
      },
    });

    let audioLink = '';

    if (audioRelease.releaseAudio) {
      audioLink = audioRelease.releaseAudio;
    } else {
      audioLink = audioRelease.releaseAudioLink;
    }

    await this.prismaService.track.create({
      data: {
        title: dto.title,
        audioId: audioRelease.id,
        trackNumber: 1,
        audioLink,
        productionCredit: dto.productionHolder,
        lyrics: dto.lyrics,
        ISRC: audioRelease.ISRC,
      },
    });

    if (audioRelease) {
      // send email
      this.musicReleaseService.sendMusicReleaseEmail(user.email, user.name);
      // send notification
      this.notificationService.sendMusicReleaseEmail();
    }
    return 'Audio Release Created';
  }

  async getAudioReleasesByUserId(dto: UserIdDto) {
    const audioReleases = await this.prismaService.audio.findMany({
      where: {
        userId: dto.userId,
      },
      select: {
        id: true,
        title: true,
        artist: true,
        releaseCover: true,
        status: true,
        UPC: true,
        smartLink: true,
        releaseDate: true,
      },
    });

    if (audioReleases.length === 0) {
      return [];
    }

    return audioReleases;
  }

  async getAudioReleaseById(dto: AudioByIdDto) {
    const { audioId } = dto;
    const audio = await this.prismaService.audio.findUnique({
      where: {
        id: audioId,
      },
      include: {
        Track: true,
      },
    });

    if (!audio) {
      return null;
    }

    return audio;
  }

  async getAudioById(dto: AudioByIdDto) {
    const { audioId } = dto;
    const audio = await this.prismaService.audio.findUnique({
      where: {
        id: audioId,
      },
      select: {
        releaseCover: true,
        title: true,
      },
    });

    if (!audio) {
      return null;
    }

    return audio;
  }
}
