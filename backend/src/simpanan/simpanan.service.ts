// src/simpanan/simpanan.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PrismaClient, SimpananSaldo } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service'; // Sesuaikan path jika berbeda
import { CreateSimpananTransaksiDto } from './dto/create-simpanan-transaksi.dto';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // Import DTO user

type SaldoWithMemberInfo = SimpananSaldo & {
  member: { fullName: string | null; memberNumber: string | null } | null;
};
type SaldoNolWithMemberInfo = {
  id: string | null;
  memberId: string;
  saldoPokok: number;
  saldoWajib: number;
  saldoSukarela: number;
  lastUpdatedAt: Date;
  member: { fullName: string | null; memberNumber: string | null } | null;
};
@Injectable()
export class SimpananService {
  constructor(private prisma: PrismaService) {}

  async createTransaksi(
    createDto: CreateSimpananTransaksiDto,
    user: JwtPayloadDto,
  ) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { memberId, jenis, tipe, jumlah, uraian, nomorBukti } = createDto;

    // Validasi Member
    const member = await prismaTenant.member.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Anggota dengan ID ${memberId} tidak ditemukan.`,
      );
    }

    // Generate Nomor Bukti jika tidak disediakan
    const finalNomorBukti = nomorBukti || `TRX-SIMP-${Date.now()}`;

    try {
      // Gunakan transaksi database untuk memastikan konsistensi
      const result = await prismaTenant.$transaction(async (tx) => {
        // 1. Catat Transaksi Simpanan
        const newTransaksi = await tx.simpananTransaksi.create({
          data: {
            memberId,
            jenis,
            tipe,
            jumlah,
            uraian,
            nomorBukti: finalNomorBukti,
            userId: user.userId, // Catat siapa pengurus yang input
            // tanggal: createDto.tanggal ? new Date(createDto.tanggal) : new Date(), // Jika tanggal dikirim dari DTO
          },
        });

        // 2. Update atau Buat Saldo Anggota
        const currentSaldo = await tx.simpananSaldo.findUnique({
          where: { memberId },
        });

        let newSaldoPokok = currentSaldo?.saldoPokok || 0;
        let newSaldoWajib = currentSaldo?.saldoWajib || 0;
        let newSaldoSukarela = currentSaldo?.saldoSukarela || 0;

        if (tipe === 'SETORAN') {
          if (jenis === 'POKOK') newSaldoPokok += jumlah;
          else if (jenis === 'WAJIB') newSaldoWajib += jumlah;
          else if (jenis === 'SUKARELA') newSaldoSukarela += jumlah;
        } else if (tipe === 'PENARIKAN') {
          // Validasi saldo cukup (hanya untuk Sukarela biasanya, Pokok & Wajib jarang ditarik)
          if (jenis === 'SUKARELA') {
            if (newSaldoSukarela < jumlah) {
              throw new BadRequestException(
                'Saldo simpanan sukarela tidak mencukupi untuk penarikan.',
              );
            }
            newSaldoSukarela -= jumlah;
          } else {
            // Tambahkan validasi lain jika penarikan Pokok/Wajib diizinkan
            throw new BadRequestException(
              `Penarikan untuk simpanan ${jenis} tidak diizinkan atau saldo tidak cukup.`,
            );
          }
        }

        // Upsert: update jika ada, create jika belum ada
        await tx.simpananSaldo.upsert({
          where: { memberId },
          update: {
            saldoPokok: newSaldoPokok,
            saldoWajib: newSaldoWajib,
            saldoSukarela: newSaldoSukarela,
          },
          create: {
            memberId,
            saldoPokok: newSaldoPokok,
            saldoWajib: newSaldoWajib,
            saldoSukarela: newSaldoSukarela,
          },
        });

        return newTransaksi;
      });
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Lemparkan kembali BadRequestException
      }
      console.error('Gagal membuat transaksi simpanan:', error);
      throw new InternalServerErrorException(
        'Gagal memproses transaksi simpanan.',
      );
    }
  }

  async findAllTransaksi(memberId?: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const whereClause: Prisma.SimpananTransaksiWhereInput = memberId
      ? { memberId }
      : {};

    return prismaTenant.simpananTransaksi.findMany({
      where: whereClause,
      include: {
        member: { select: { fullName: true, memberNumber: true } }, // Sertakan nama anggota
        dicatatOleh: { select: { fullName: true } }, // Sertakan nama pencatat (pengurus)
      },
      orderBy: {
        tanggal: 'desc', // Urutkan berdasarkan terbaru
      },
    });
  }

  async findSaldoByMemberId(
    memberId: string,
  ): Promise<SaldoWithMemberInfo | SaldoNolWithMemberInfo> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const saldo = await prismaTenant.simpananSaldo.findUnique({
      where: { memberId },
      include: {
        member: { select: { fullName: true, memberNumber: true } },
      },
    });

    if (!saldo) {
      // Jika belum ada saldo, cari info member secara terpisah
      const member = await prismaTenant.member.findUnique({
        where: { id: memberId },
        select: { fullName: true, memberNumber: true },
      });

      if (!member) {
        throw new NotFoundException(
          `Anggota dengan ID ${memberId} tidak ditemukan.`,
        );
      }

      // Kembalikan objek dengan struktur yang konsisten (SaldoNolWithMemberInfo)
      return {
        id: null, // Tidak ada ID saldo
        memberId: memberId,
        saldoPokok: 0,
        saldoWajib: 0,
        saldoSukarela: 0,
        lastUpdatedAt: new Date(), // Waktu saat ini sebagai placeholder
        member: member, // Sekarang properti member valid
      };
    }
    // Jika saldo ditemukan, kembalikan dengan tipe SaldoWithMemberInfo
    return saldo;
  }

  // Fungsi untuk mendapatkan total simpanan per jenis (untuk admin dashboard)
  async getAggregatedSaldo() {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const result = await prismaTenant.simpananSaldo.aggregate({
      _sum: {
        saldoPokok: true,
        saldoWajib: true,
        saldoSukarela: true,
      },
    });
    return {
      totalPokok: result._sum.saldoPokok ?? 0,
      totalWajib: result._sum.saldoWajib ?? 0,
      totalSukarela: result._sum.saldoSukarela ?? 0,
    };
  }
}
