import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
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
        const existingBoardPosition = await tx.boardPosition.findFirst({
          where: {
            memberId: memberId,
            tanggalBerhenti: null, // Cek Pengurus aktif
          },
        });
        if (existingBoardPosition) {
          throw new ConflictException(
            `Anggota ini sudah memegang jabatan Pengurus aktif (${existingBoardPosition.jabatan}). Selesaikan jabatan lama terlebih dahulu.`,
          );
        }
        const activeSupervisoryPosition =
          await tx.supervisoryPosition.findFirst({
            where: {
              memberId: memberId,
              tanggalBerhenti: null, // Cek apakah dia Pengawas aktif
            },
          });
        if (activeSupervisoryPosition) {
          throw new ConflictException(
            'Anggota ini sudah memegang jabatan sebagai Pengawas aktif. Tidak boleh rangkap jabatan.',
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
            signatureData: true,
          },
        },
        terminationApprovedByUser: { select: { fullName: true } },
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
      include: {
        member: true,
        terminationApprovedByUser: { select: { fullName: true } },
      },
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { memberId, tanggalDiangkat, tanggalBerhenti, ...restData } =
        updateBoardPositionDto;

      return await prismaTenant.boardPosition.update({
        where: { id },
        data: {
          ...restData,

          ...(tanggalDiangkat && {
            tanggalDiangkat: new Date(tanggalDiangkat),
          }),

          ...(tanggalBerhenti !== undefined && {
            tanggalBerhenti: tanggalBerhenti ? new Date(tanggalBerhenti) : null,
          }),

          ...(tanggalBerhenti === null && {
            terminationApprovedByUserId: null,
            terminationApprovedAt: null,
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
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        console.error('Foreign key constraint violation during update:', err); // Log detail error P2003
        throw new InternalServerErrorException(
          'Gagal memperbarui data karena masalah relasi.',
        );
      }
      console.error(`Gagal update posisi pengurus ${id}:`, err); // Log error lain
      throw new InternalServerErrorException(
        'Gagal memperbarui posisi pengurus.',
      ); // Lempar error generik
    }
  }

  // Menggunakan soft delete (update tanggalBerhenti)
  async remove(id: string, reason: string = 'Diberhentikan') {
    const prismaTenant = await this.prisma.getTenantClient();

    try {
      const updatedPosition = await prismaTenant.$transaction(async (tx) => {
        // 1. Dapatkan posisi saat ini untuk mendapatkan memberId
        const position = await tx.boardPosition.findUnique({
          where: { id },
          select: { memberId: true },
        });

        if (!position) {
          throw new NotFoundException(
            `Posisi Pengurus dengan ID ${id} tidak ditemukan.`,
          );
        }
        const memberId = position.memberId;

        // 2. Update BoardPosition (Soft Delete)
        const updatedBoardPos = await tx.boardPosition.update({
          where: { id },
          data: {
            tanggalBerhenti: new Date(),
            alasanBerhenti: reason,
          },
        });

        // 3. (LOGIKA BARU) Cek apakah user masih punya jabatan lain?
        const otherBoardPositions = await tx.boardPosition.count({
          where: {
            memberId: memberId,
            tanggalBerhenti: null, // Jabatan pengurus lain yang masih aktif
          },
        });

        const otherSupervisoryPositions = await tx.supervisoryPosition.count({
          where: {
            memberId: memberId,
            tanggalBerhenti: null, // Jabatan pengawas lain yang masih aktif
          },
        });

        // 4. Jika SUDAH TIDAK punya jabatan lain, demote ke Anggota
        if (otherBoardPositions === 0 && otherSupervisoryPositions === 0) {
          const anggotaRole = await tx.role.findUnique({
            where: { name: Role.Anggota },
          });
          if (!anggotaRole) {
            throw new InternalServerErrorException(
              "KRITIS: Role 'Anggota' tidak ditemukan.",
            );
          }

          // Update User Role menjadi Anggota
          await tx.user.update({
            where: { id: memberId },
            data: {
              roleId: anggotaRole.id,
            },
          });
          console.log(
            `[BoardPositionsService] User ${memberId} didemote ke Anggota.`,
          );
        } else {
          console.log(
            `[BoardPositionsService] User ${memberId} tidak didemote (masih punya ${otherBoardPositions} jabatan pengurus / ${otherSupervisoryPositions} jabatan pengawas aktif).`,
          );
        }

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

  /**
   * (Ketua) Memberikan approval pada proses pemberhentian jabatan pengurus.
   * @param id ID Posisi Jabatan (BoardPosition ID)
   * @param ketuaUserId ID User Ketua
   */
  async approveTermination(
    id: string,
    ketuaUserId: string,
  ): Promise<BoardPosition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      // 1. Pastikan posisi jabatan ada
      const position = await prismaTenant.boardPosition.findUnique({
        where: { id },
      });
      if (!position) {
        throw new NotFoundException(
          `Posisi Pengurus dengan ID ${id} tidak ditemukan.`,
        );
      }

      // 2. Validasi: Pastikan jabatan memang sudah berhenti (punya tanggalBerhenti)
      if (!position.tanggalBerhenti) {
        throw new BadRequestException(
          `Posisi Pengurus dengan ID ${id} belum diberhentikan.`,
        );
      }

      // TODO: Tambahkan validasi apakah ketuaUserId benar-benar Ketua (jika perlu)

      // 3. Update data approval
      const approvedPosition = await prismaTenant.boardPosition.update({
        where: { id },
        data: {
          terminationApprovedByUserId: ketuaUserId,
          terminationApprovedAt: new Date(),
        },
        include: {
          // Sertakan nama approver di response
          member: { select: { fullName: true } },
          terminationApprovedByUser: { select: { fullName: true } },
        },
      });
      return approvedPosition;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        `Gagal approve terminasi jabatan ${id} oleh Ketua ${ketuaUserId}:`,
        error,
      );
      throw new Error('Gagal memproses approval terminasi jabatan oleh Ketua.');
    }
  }

  async findMyActivePositions(memberId: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    console.log(
      `[BoardPositionsService] Mencari jabatan aktif untuk memberId: ${memberId}`,
    ); // Logging
    try {
      const activePositions = await prismaTenant.boardPosition.findMany({
        where: {
          memberId: memberId, // Cari berdasarkan ID member yang login
          tanggalBerhenti: null, // Hanya yang masih aktif (belum berhenti)
        },
        select: {
          // Hanya ambil data yang diperlukan frontend
          jabatan: true,
          tanggalDiangkat: true,
          // id: true // Bisa ditambahkan jika perlu ID record jabatannya
        },
      });
      console.log(
        `[BoardPositionsService] Jabatan aktif ditemukan:`,
        activePositions,
      ); // Logging hasil
      return activePositions;
    } catch (error) {
      console.error(
        `[BoardPositionsService] Error mencari jabatan aktif untuk ${memberId}:`,
        error,
      );
      // Pertimbangkan melempar InternalServerErrorException jika perlu
      throw new InternalServerErrorException(
        'Gagal mengambil data jabatan aktif.',
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
