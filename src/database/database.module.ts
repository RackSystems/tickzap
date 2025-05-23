import { Module } from '@nestjs/common';
import { database } from './database';

@Module({
  providers: [...database],
  exports: [...database],
})
export class DatabaseModule {}
