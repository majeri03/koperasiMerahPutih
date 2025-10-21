import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBoardPositionDto } from './dto/create-board-position.dto';
import { UpdateBoardPositionDto } from './dto/update-board-position.dto';
import { BoardPosition, PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class BoardPositionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBoardPositionDto: CreateBoardPositionDto,
  ): Promise<BoardPosition & { member: { fullName: string } }> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Opsional: Cek apakah memberId valid
    const memberExists = await prismaTenant.member.findUnique({
      where: { id: createBoardPositionDto.memberId },
    });
    if (!memberExists) {
      throw new NotFoundException(
        `Anggota dengan ID ${createBoardPositionDto.memberId} tidak ditemukan.`,
      );
    }

    return prismaTenant.boardPosition.create({
      data: {
        ...createBoardPositionDto,
        tanggalDiangkat: new Date(createBoardPositionDto.tanggalDiangkat),
      },
      include: { member: { select: { fullName: true } } },
    });
  }

  async findAll() {
    const prismaTenant = await this.prisma.getTenantClient();
    return prismaTenant.boardPosition.findMany({
      include: {
        member: {
          // Sertakan detail anggota terkait
          select: {
            id: true,
            memberNumber: true,
            fullName: true,
            occupation: true, // Ambil data yang relevan dari member
            address: true,
            gender: true,
            placeOfBirth: true,
            dateOfBirth: true,
          },
        },
      },
      orderBy: {
        tanggalDiangkat: 'desc', // Urutkan berdasarkan tanggal diangkat
      },
    });
  }

  async findOne(id: string) {
    const prismaTenant = await this.prisma.getTenantClient();
    const position = await prismaTenant.boardPosition.findUnique({
      where: { id },
      include: { member: true }, // Sertakan detail anggota
    });
    if (!position) {
      throw new NotFoundException(
        `Posisi Pengurus dengan ID ${id} tidak ditemukan.`,
      );
    }
    return position;
  }

  async update(id: string, updateBoardPositionDto: UpdateBoardPositionDto) {
    const prismaTenant = await this.prisma.getTenantClient();
    try {
      return await prismaTenant.boardPosition.update({
        where: { id },
        data: {
          ...updateBoardPositionDto,
          // Konversi string tanggal ke Date jika ada
          ...(updateBoardPositionDto.tanggalDiangkat && {
            tanggalDiangkat: new Date(updateBoardPositionDto.tanggalDiangkat),
          }),
          ...(updateBoardPositionDto.tanggalBerhenti && {
            tanggalBerhenti: new Date(updateBoardPositionDto.tanggalBerhenti),
          }),
        },
        include: { member: { select: { fullName: true } } },
      });
    } catch (err: unknown) {
      // Narrowing: hanya akses .code jika error adalah PrismaClientKnownRequestError
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Posisi Pengurus dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw err;
    }
  }

  // Menggunakan soft delete (update tanggalBerhenti)
  async remove(id: string, reason: string = 'Diberhentikan') {
    const prismaTenant = await this.prisma.getTenantClient();
    try {
      return await prismaTenant.boardPosition.update({
        where: { id },
        data: {
          tanggalBerhenti: new Date(), // Set tanggal berhenti ke sekarang
          alasanBerhenti: reason,
        },
      });
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Posisi Pengurus dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw err;
    }
  }

  // Jika benar-benar ingin hard delete (tidak disarankan untuk data historis)
  // async hardRemove(id: string) {
  //   const prismaTenant = await this.prisma.getTenantClient();
  //   try {
  //     return await prismaTenant.boardPosition.delete({
  //       where: { id },
  //     });
  //   } catch (error) {
  //      if (error.code === 'P2025') {
  //       throw new NotFoundException(`Posisi Pengurus dengan ID ${id} tidak ditemukan.`);
  //     }
  //     throw error;
  //   }
  // }
}
