import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StreamsService } from './services/streams.service';
import { CreateStreamsDTO } from './dto/create-stream.dto';
import { TimeRangeDTO } from './dto/time-range.dto';
import { CountryService } from './services/country.service';

@Controller('api')
export class StreamsController {
  constructor(
    private readonly streamsService: StreamsService,
    private readonly countryService: CountryService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/streams')
  create(@Body() createStreamDto: CreateStreamsDTO) {
    return this.streamsService.create(createStreamDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/streams/country')
  createCountryStreams(@Body() createStreamDto: CreateStreamsDTO) {
    return this.countryService.create(createStreamDto);
  }

  @Get('/streams/:id') // Keep the ID in the route
  findOne(@Param('id') id: string, @Query() timeRangeDto: TimeRangeDTO) {
    return this.streamsService.findOneById(id, timeRangeDto);
  }

  @Get('/all-streams/:id')
  findAll(@Param('id') id: string, @Query() timeRangeDto: TimeRangeDTO) {
    return this.streamsService.findAllStreamsByUserId(id, timeRangeDto);
  }

  @Get('/streams/audio-streams/:id') // Keep the ID in the route
  findAllByStreams(@Param('id') id: string) {
    return this.streamsService.findAllByAudioStreams(id);
  }

  @Get('/streams/country/:id') // Keep the ID in the route
  findAllStreamsCountry(@Param('id') id: string) {
    return this.countryService.findAllCountryStreamsByUserId(id);
  }
}
