// backend/src/supervisory-positions/supervisory-positions.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSupervisoryPositionDto } from './dto/create-supervisory-position.dto';
import { UpdateSupervisoryPositionDto } from './dto/update-supervisory-position.dto';
import { PrismaClient, SupervisoryPosition, Prisma } from '@prisma/client';
import { Role } from 'src/auth/enums/role.enum';
@Injectable()
export class SupervisoryPositionsService {
  constructor(private prisma: PrismaService) {}

  // Tipe return ditambahkan untuk kejelasan
  async create(
    createDto: CreateSupervisoryPositionDto,
  ): Promise<SupervisoryPosition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { memberId, ...positionData } = createDto;

    try {
      // Kita gunakan transaksi untuk memastikan data konsisten
      const result = await prismaTenant.$transaction(async (tx) => {
        // 1. Validasi Member
        const memberExists = await tx.member.findUnique({
          where: { id: memberId },
        });
        if (!memberExists) {
          throw new NotFoundException(
            `Anggota dengan ID ${memberId} tidak ditemukan.`,
          );
        }

        // 2. Validasi User (Akun Login)
        const userExists = await tx.user.findUnique({
          where: { id: memberId }, // ID User = ID Member
        });
        if (!userExists) {
          throw new ConflictException(
            `Anggota dengan ID ${memberId} tidak memiliki akun login (User). Harap buatkan akun terlebih dahulu.`,
          );
        }

        // 3. Dapatkan ID Role "Pengawas"
        const pengawasRole = await tx.role.findUnique({
          where: { name: Role.Pengawas }, // Ambil dari Enum
        });
        if (!pengawasRole) {
          throw new InternalServerErrorException(
            "Role 'Pengawas' tidak ditemukan di database.",
          );
        }

        // 4. Buat Jabatan Pengawas baru
        const newPosition = await tx.supervisoryPosition.create({
          data: {
            ...positionData,
            memberId: memberId,
            tanggalDiangkat: new Date(positionData.tanggalDiangkat),
          },
        });

        // 5. Promosikan Role User menjadi "Pengawas"
        await tx.user.update({
          where: { id: memberId },
          data: {
            roleId: pengawasRole.id, // Update Role ID
          },
        });

        return newPosition;
      });

      return result;
    } catch (error) {
      // Lempar ulang error yang sudah kita definisikan
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      // Tangani error lain jika ada
      console.error('Gagal mempromosikan pengawas:', error);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat memproses jabatan pengawas.',
      );
    }
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
