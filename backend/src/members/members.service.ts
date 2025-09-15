import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    const prismaTenant = await this.prisma.getTenantClient();

    const memberNumber = `AGT-${Date.now()}`;

    const newMember = await prismaTenant.member.create({
      data: {
        ...createMemberDto,
        dateOfBirth: new Date(createMemberDto.dateOfBirth),
        memberNumber,
      },
    });

    return newMember;
  }

  async findAll() {
    const prismaTenant = await this.prisma.getTenantClient();
    return prismaTenant.member.findMany();
  }

  async findOne(id: string) {
    const prismaTenant = await this.prisma.getTenantClient();
    return prismaTenant.member.findUnique({ where: { id } });
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const prismaTenant = await this.prisma.getTenantClient();
    return prismaTenant.member.update({
      where: { id },
      data: {
        ...updateMemberDto,
        // Pastikan tanggal diformat dengan benar jika ada di DTO pembaruan
        ...(updateMemberDto.dateOfBirth && {
          dateOfBirth: new Date(updateMemberDto.dateOfBirth),
        }),
      },
    });
  }

  async remove(id: string) {
    const prismaTenant = await this.prisma.getTenantClient();
    // Sebaiknya nonaktifkan anggota daripada menghapus (soft delete)
    return prismaTenant.member.update({
      where: { id },
      data: { status: 'RESIGNED' },
    });
  }
}
