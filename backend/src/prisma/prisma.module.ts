import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Menjadikan modul ini global agar tidak perlu di-import berulang kali
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Ekspor service agar bisa di-inject di modul lain
})
export class PrismaModule {}
