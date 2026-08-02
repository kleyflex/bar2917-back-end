import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { LocationDto } from './dto/location.dto';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  async getAll() {
    return this.locationService.getAll();
  }

  @Get('phone/by-address')
  async getPhoneByAddress(@Query('address') address: string) {
    return this.locationService.getPhoneByAddress(address);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.locationService.getById(+id);
  }

  @HttpCode(200)
  @Auth('admin')
  @Post()
  async create(@Body() locationDto: LocationDto) {
    return this.locationService.createLocation(locationDto);
  }

  @HttpCode(200)
  @Auth('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: LocationDto
  ) {
    return this.locationService.updateLocation(+id, dto);
  }

  @HttpCode(200)
  @Auth('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.locationService.deleteLocation(+id);
  }
} 
