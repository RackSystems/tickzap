import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: process.env.DB_DATABASE,
      entities: ['src/**/entities/*.entity{.ts,.js}'],
      host: process.env.DB_HOST,
      migrations: ['src/database/migrations/*{.ts,.js}'],
      password: process.env.DB_PASSWORD,
      port: 5432,
      synchronize: false,
      type: 'postgres',
      username: process.env.DB_USERNAME,
    }),
    UsersModule,
    AuthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
