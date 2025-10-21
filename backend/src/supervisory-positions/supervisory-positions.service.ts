// backend/src/supervisory-positions/supervisory-positions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Sesuaikan path jika perlu
import { CreateSupervisoryPositionDto } from './dto/create-supervisory-position.dto';
import { UpdateSupervisoryPositionDto } from './dto/update-supervisory-position.dto';
import { PrismaClient, SupervisoryPosition, Prisma } from '@prisma/client'; // Impor tipe

@Injectable()
export class SupervisoryPositionsService {
  constructor(private prisma: PrismaService) {}

  // Tipe return ditambahkan untuk kejelasan
  async create(
    createDto: CreateSupervisoryPositionDto,
  ): Promise<SupervisoryPosition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Validasi Member ID (Sama seperti Pengurus)
    const memberExists = await prismaTenant.member.findUnique({
      where: { id: createDto.memberId },
    });
    if (!memberExists) {
      throw new NotFoundException(
        `Anggota dengan ID ${createDto.memberId} tidak ditemukan.`,
      );
    }

    return prismaTenant.supervisoryPosition.create({
      data: {
        ...createDto,
        tanggalDiangkat: new Date(createDto.tanggalDiangkat),
      },
      // Anda bisa menambahkan include member jika ingin responsnya menyertakan nama
      // include: { member: { select: { fullName: true } } },
    });
  }

  async findAll() {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    // Mengambil semua posisi pengawas beserta detail anggota terkait
    return prismaTenant.supervisoryPosition.findMany({
      include: {
        member: {
          // Sertakan detail anggota
          select: {
            id: true,
            memberNumber: true,
            fullName: true,
            occupation: true,
            address: true,
            gender: true,
            placeOfBirth: true,
            dateOfBirth: true,
          },
        },
      },
      orderBy: {
        tanggalDiangkat: 'desc', // Urutkan berdasarkan tanggal diangkat terbaru
      },
    });
  }

  async findOne(id: string): Promise<SupervisoryPosition | null> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const position = await prismaTenant.supervisoryPosition.findUnique({
      where: { id },
      include: { member: true }, // Sertakan detail anggota
    });
    if (!position) {
      throw new NotFoundException(
        `Posisi Pengawas dengan ID ${id} tidak ditemukan.`,
      );
    }
    return position;
  }

  async update(
    id: string,
    updateDto: UpdateSupervisoryPositionDto,
  ): Promise<SupervisoryPosition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      return await prismaTenant.supervisoryPosition.update({
        where: { id },
        data: {
          ...updateDto,
          // Konversi string tanggal ke Date jika ada
          ...(updateDto.tanggalDiangkat && {
            tanggalDiangkat: new Date(updateDto.tanggalDiangkat),
          }),
          ...(updateDto.tanggalBerhenti && {
            tanggalBerhenti: new Date(updateDto.tanggalBerhenti),
          }),
          // Set null jika dikirim sebagai string kosong atau null
          ...((updateDto.tanggalBerhenti === null ||
            updateDto.tanggalBerhenti === '') && {
            tanggalBerhenti: null,
          }),
          ...((updateDto.alasanBerhenti === null ||
            updateDto.alasanBerhenti === '') && {
            alasanBerhenti: null,
          }),
        },
        // Anda bisa menambahkan include member jika ingin responsnya menyertakan nama
        // include: { member: { select: { fullName: true } } },
      });
    } catch (err: unknown) {
      // Handle jika ID tidak ditemukan saat update
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Posisi Pengawas dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw err;
    }
  }

  // Soft delete (menonaktifkan)
  async remove(
    id: string,
    reason: string = 'Diberhentikan',
  ): Promise<SupervisoryPosition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      return await prismaTenant.supervisoryPosition.update({
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
          `Posisi Pengawas dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw err;
    }
  }
}
