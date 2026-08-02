import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { StatiscticsController } from './statisctics.controller';
import { StatiscticsService } from './statisctics.service';

@Module({
  imports: [UserModule],
  controllers: [StatiscticsController],
  providers: [StatiscticsService]
})
export class StatiscticsModule {}
