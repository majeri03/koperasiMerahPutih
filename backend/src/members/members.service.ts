import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Member, Prisma, PrismaClient } from '@prisma/client';
@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const prismaTenant = await this.prisma.getTenantClient();

    const memberNumber = `AGT-${Date.now()}`;
    const existingNik = await prismaTenant.member.findUnique({
      where: { nik: createMemberDto.nik },
      select: { id: true },
    });
    if (existingNik) {
      throw new BadRequestException(
        `NIK ${createMemberDto.nik} sudah terdaftar.`,
      );
    }
    try {
      const { phoneNumber, signatureData, ...restData } = createMemberDto;
      const newMember = await prismaTenant.member.create({
        data: {
          ...restData,
          phoneNumber: phoneNumber || null,
          ...createMemberDto,
          dateOfBirth: new Date(createMemberDto.dateOfBirth),
          memberNumber,
          signatureData: signatureData || null,
        },
      });

      return newMember;
    } catch (error) {
      console.error('Gagal membuat anggota:', error);
      throw new Error('Gagal menyimpan data anggota baru.');
    }
  }

  async findAll(): Promise<Member[]> {
    const prismaTenant = await this.prisma.getTenantClient();
    return prismaTenant.member.findMany({
      orderBy: { memberNumber: 'asc' }, // Urutkan berdasarkan nomor anggota
      include: {
        // Sertakan nama user ketua yang approve (jika ada)
        approvedByKetua: { select: { fullName: true } },
        terminationApprovedByKetua: { select: { fullName: true } },
      },
    });
  }

  async findOne(id: string): Promise<Member> {
    const prismaTenant = await this.prisma.getTenantClient();
    try {
      const member = await prismaTenant.member.findUniqueOrThrow({
        where: { id },
        include: {
          approvedByKetua: { select: { fullName: true } },
          terminationApprovedByKetua: { select: { fullName: true } },
        },
      });
      return member;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Anggota dengan ID ${id} tidak ditemukan.`);
      }
      console.error(`Error mencari anggota ${id}:`, error);
      throw new Error('Gagal mengambil data anggota.');
    }
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    // Tambah tipe return Member
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const {
      dateOfBirth,
      signatureData,
      resignationRequestDate,
      terminationDate,
      terminationReason,
      ...restData
    } = updateMemberDto;

    // Ambil data NIK dari DTO jika ada, untuk cek duplikasi
    const newNik = updateMemberDto.nik;

    try {
      // 1. Cek anggota ada
      await this.findOne(id); // Akan throw NotFoundException jika tidak ada

      // 2. Jika NIK diubah, cek duplikasinya
      if (newNik) {
        const existingNik = await prismaTenant.member.findFirst({
          where: {
            nik: newNik,
            id: { not: id }, // Kecualikan diri sendiri
          },
          select: { id: true },
        });
        if (existingNik) {
          throw new BadRequestException(
            `NIK ${newNik} sudah digunakan oleh anggota lain.`,
          );
        }
      }

      // 3. Lakukan update
      const updatedMember = await prismaTenant.member.update({
        where: { id },
        data: {
          ...restData,
          // Konversi tanggal jika ada
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(signatureData !== undefined && {
            signatureData: signatureData || null,
          }), // Update TTD (bisa null)
          ...(resignationRequestDate !== undefined && {
            resignationRequestDate: resignationRequestDate
              ? new Date(resignationRequestDate)
              : null,
          }),
          ...(terminationDate !== undefined && {
            terminationDate: terminationDate ? new Date(terminationDate) : null,
          }),
          ...(terminationReason !== undefined && {
            terminationReason: terminationReason || null,
          }),
          // Jika tanggal berhenti jadi null, reset juga alasan dan approval berhenti
          ...(terminationDate === null && {
            terminationReason: null,
            terminationApprovedByKetuaId: null,
            terminationApprovedAt: null,
          }),
        },
      });
      return updatedMember;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Lemparkan ulang error yang sudah valid
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Anggota dengan ID ${id} tidak ditemukan saat update.`,
        );
      }
      console.error(`Gagal update anggota ${id}:`, error);
      throw new Error('Gagal memperbarui data anggota.');
    }
  }

  /**
   * (Pengurus) Menonaktifkan anggota (soft delete).
   * Mengisi tanggal berhenti dan alasan.
   * Mengubah status menjadi 'RESIGNED' atau 'EXPELLED'.
   * @param id ID Anggota
   * @param reason Alasan berhenti/dipecat
   * @param isExpelled Jika true, status jadi 'EXPELLED', default 'RESIGNED'
   */
  async terminate(
    id: string,
    reason: string = 'Mengundurkan diri',
    isExpelled: boolean = false,
  ): Promise<Member> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const terminationStatus = isExpelled ? 'EXPELLED' : 'RESIGNED';

    try {
      await this.findOne(id); // Pastikan anggota ada

      const updatedMember = await prismaTenant.member.update({
        where: { id },
        data: {
          status: terminationStatus,
          terminationDate: new Date(), // Set tanggal berhenti sekarang
          terminationReason: reason,
          // Approval berhenti oleh Ketua dilakukan via endpoint terpisah
        },
      });
      return updatedMember;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Anggota dengan ID ${id} tidak ditemukan untuk dinonaktifkan.`,
        );
      }
      console.error(`Gagal menonaktifkan anggota ${id}:`, error);
      throw new Error('Gagal menonaktifkan anggota.');
    }
  }
  /**
   * (Ketua) Memberikan approval pada data anggota yang baru dibuat/disetujui.
   * @param id ID Anggota
   * @param ketuaUserId ID User Ketua
   */
  async approveByKetua(id: string, ketuaUserId: string): Promise<Member> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      await this.findOne(id); // Pastikan anggota ada

      // TODO: Tambahkan validasi apakah ketuaUserId benar-benar Ketua (jika perlu)

      const approvedMember = await prismaTenant.member.update({
        where: { id },
        data: {
          approvedByKetuaId: ketuaUserId,
          approvedAt: new Date(),
        },
        include: {
          // Sertakan nama approver di response
          approvedByKetua: { select: { fullName: true } },
          terminationApprovedByKetua: { select: { fullName: true } },
        },
      });
      return approvedMember;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Anggota dengan ID ${id} tidak ditemukan untuk diapprove.`,
        );
      }
      console.error(
        `Gagal approve anggota ${id} oleh Ketua ${ketuaUserId}:`,
        error,
      );
      throw new Error('Gagal memproses approval Ketua.');
    }
  }

  /**
   * (Ketua) Memberikan approval pada proses pemberhentian anggota.
   * @param id ID Anggota
   * @param ketuaUserId ID User Ketua
   */
  async approveTerminationByKetua(
    id: string,
    ketuaUserId: string,
  ): Promise<Member> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const member = await this.findOne(id); // Pastikan anggota ada

      // Validasi: Pastikan anggota memang sudah dalam proses berhenti (punya terminationDate)
      if (!member.terminationDate) {
        throw new BadRequestException(
          `Anggota dengan ID ${id} belum dalam proses pemberhentian.`,
        );
      }

      // TODO: Tambahkan validasi apakah ketuaUserId benar-benar Ketua (jika perlu)

      const approvedMember = await prismaTenant.member.update({
        where: { id },
        data: {
          terminationApprovedByKetuaId: ketuaUserId,
          terminationApprovedAt: new Date(),
        },
        include: {
          // Sertakan nama approver di response
          approvedByKetua: { select: { fullName: true } },
          terminationApprovedByKetua: { select: { fullName: true } },
        },
      });
      return approvedMember;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(
        `Gagal approve terminasi anggota ${id} oleh Ketua ${ketuaUserId}:`,
        error,
      );
      throw new Error('Gagal memproses approval terminasi oleh Ketua.');
    }
  }
}
