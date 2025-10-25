import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBoardPositionDto } from './dto/create-board-position.dto';
import { UpdateBoardPositionDto } from './dto/update-board-position.dto';
import { BoardPosition, PrismaClient, Prisma } from '@prisma/client';
import { Role } from 'src/auth/enums/role.enum';
@Injectable()
export class BoardPositionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBoardPositionDto: CreateBoardPositionDto,
  ): Promise<BoardPosition & { member: { fullName: string } }> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { memberId, ...positionData } = createBoardPositionDto;

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
        // Kita asumsikan anggota HARUS punya akun User untuk jadi pengurus
        const userExists = await tx.user.findUnique({
          where: { id: memberId }, // Ingat, ID User = ID Member
        });
        if (!userExists) {
          throw new ConflictException(
            `Anggota dengan ID ${memberId} tidak memiliki akun login (User). Harap buatkan akun terlebih dahulu.`,
          );
        }

        // 3. Dapatkan ID Role "Pengurus"
        const pengurusRole = await tx.role.findUnique({
          where: { name: Role.Pengurus }, // Ambil dari Enum
        });
        if (!pengurusRole) {
          throw new InternalServerErrorException(
            "Role 'Pengurus' tidak ditemukan di database.",
          );
        }

        // 4. Buat Jabatan Pengurus baru
        const newPosition = await tx.boardPosition.create({
          data: {
            ...positionData,
            memberId: memberId,
            tanggalDiangkat: new Date(positionData.tanggalDiangkat),
          },
          include: { member: { select: { fullName: true } } },
        });

        // 5. Promosikan Role User menjadi "Pengurus"
        await tx.user.update({
          where: { id: memberId },
          data: {
            roleId: pengurusRole.id, // Update Role ID
          },
        });

        return newPosition;
      });

      return result;
    } catch (error) {
      // Lempar ulang error yang sudah kita definisikan (NotFound, Conflict, etc)
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      // Tangani error lain jika ada
      console.error('Gagal mempromosikan pengurus:', error);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat memproses jabatan pengurus.',
      );
    }
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
      // Gunakan transaksi
      const updatedPosition = await prismaTenant.$transaction(async (tx) => {
        // 1. Dapatkan posisi saat ini untuk mendapatkan memberId
        const position = await tx.boardPosition.findUnique({
          where: { id },
          select: { memberId: true }, // Hanya ambil memberId
        });

        if (!position) {
          throw new NotFoundException(
            `Posisi Pengurus dengan ID ${id} tidak ditemukan.`,
          );
        }
        const memberId = position.memberId;

        // 2. Dapatkan ID Role "Anggota"
        const anggotaRole = await tx.role.findUnique({
          where: { name: Role.Anggota }, // Gunakan Enum Role
        });
        if (!anggotaRole) {
          throw new InternalServerErrorException(
            "KRITIS: Role 'Anggota' tidak ditemukan.",
          );
        }

        // 3. Update BoardPosition (Soft Delete)
        const updatedBoardPos = await tx.boardPosition.update({
          where: { id },
          data: {
            tanggalBerhenti: new Date(), // Set tanggal berhenti
            alasanBerhenti: reason,
          },
        });

        // 4. Update User Role menjadi Anggota
        await tx.user.update({
          where: { id: memberId },
          data: {
            roleId: anggotaRole.id,
          },
        });

        return updatedBoardPos;
      });

      return updatedPosition;
    } catch (err: unknown) {
      if (
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      // Tangani error Prisma P2025 jika findUnique gagal di luar dugaan
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Posisi Pengurus dengan ID ${id} tidak ditemukan saat mencoba menghapus.`,
        );
      }
      console.error(`Gagal menghapus Posisi Pengurus ${id}:`, err);
      throw new InternalServerErrorException(
        'Gagal memproses pemberhentian pengurus.',
      );
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
