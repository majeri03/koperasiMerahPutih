// backend/src/loans/loans.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Loan, Prisma, PrismaClient } from '@prisma/client';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // Impor DTO user
import { Role } from 'src/auth/enums/role.enum'; // Impor Enum Role

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const {
      memberId,
      loanAmount,
      interestRate,
      loanDate,
      termMonths,
      ...rest
    } = createLoanDto;

    const memberExists = await prismaTenant.member.findUnique({
      where: { id: memberId },
    });
    if (!memberExists) {
      throw new NotFoundException(
        `Anggota dengan ID ${memberId} tidak ditemukan.`,
      );
    }

    const loanNumber = `PJ-${Date.now()}`;

    const loanDateObj = new Date(loanDate);
    const dueDate = new Date(loanDateObj);
    dueDate.setMonth(dueDate.getMonth() + termMonths);

    const monthlyInterest = loanAmount * (interestRate / 100);
    const monthlyPrincipal = loanAmount / termMonths;
    const monthlyTotal = monthlyPrincipal + monthlyInterest;

    const installmentsData: Prisma.LoanInstallmentCreateManyLoanInput[] = [];
    for (let i = 1; i <= termMonths; i++) {
      const installmentDueDate = new Date(loanDateObj);
      installmentDueDate.setMonth(installmentDueDate.getMonth() + i);
      installmentsData.push({
        installmentNumber: i,
        dueDate: installmentDueDate,
        principalAmount: monthlyPrincipal,
        interestAmount: monthlyInterest,
        totalAmount: monthlyTotal,
        status: 'PENDING',
      });
    }

    try {
      const newLoan = await prismaTenant.loan.create({
        data: {
          loanNumber,
          memberId,
          loanAmount,
          interestRate,
          loanDate: loanDateObj,
          termMonths,
          dueDate,
          ...rest,
          status: 'ACTIVE',
          installments: {
            createMany: {
              data: installmentsData,
            },
          },
        },
        include: {
          installments: true,
        },
      });
      return newLoan;
    } catch (error) {
      console.error('Gagal membuat pinjaman:', error);
      throw new Error('Gagal menyimpan data pinjaman baru.');
    }
  }

  // Terima parameter user
  async findAll(user: JwtPayloadDto) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const queryOptions: Prisma.LoanFindManyArgs = {
      include: {
        member: {
          select: { fullName: true, memberNumber: true },
        },
      },
      orderBy: {
        loanDate: 'desc',
      },
    };

    // Filter jika user adalah Anggota
    if (user.role === (Role.Anggota as string)) {
      queryOptions.where = {
        memberId: user.userId,
      };
    }

    return prismaTenant.loan.findMany(queryOptions);
  }

  // Terima parameter user
  async findOne(id: string, user: JwtPayloadDto) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const loan = await prismaTenant.loan.findUnique({
      where: { id },
      include: {
        member: {
          select: { fullName: true, memberNumber: true, address: true },
        },
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException(`Pinjaman dengan ID ${id} tidak ditemukan.`);
    }

    // Cek kepemilikan jika user adalah Anggota
    if (
      user.role === (Role.Anggota as string) &&
      loan.memberId !== user.userId
    ) {
      throw new ForbiddenException(
        'Anda tidak memiliki izin untuk mengakses pinjaman ini.',
      );
    }

    return loan;
  }

  async update(id: string, updateLoanDto: UpdateLoanDto) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { paidOffDate, ...restData } = updateLoanDto;

    try {
      return await prismaTenant.loan.update({
        where: { id },
        data: {
          ...restData,
          ...(paidOffDate !== undefined && {
            paidOffDate: paidOffDate ? new Date(paidOffDate) : null,
          }),
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Pinjaman dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const existingLoan = await prismaTenant.loan.findUnique({
        where: { id },
      });
      if (!existingLoan) {
        throw new NotFoundException(
          `Pinjaman dengan ID ${id} tidak ditemukan.`,
        );
      }

      await prismaTenant.loanInstallment.deleteMany({
        where: { loanId: id },
      });

      return await prismaTenant.loan.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Gagal menghapus pinjaman dengan ID ${id}. Record mungkin tidak ditemukan.`,
        );
      }
      throw error;
    }
  }

  async payInstallment(
    installmentId: string,
    paymentDate: string,
    amountPaid: number,
  ) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    try {
      const updatedInstallment = await prismaTenant.loanInstallment.update({
        where: { id: installmentId },
        data: {
          paymentDate: new Date(paymentDate),
          amountPaid: amountPaid,
          status: 'PAID',
        },
        include: { loan: true },
      });

      const unpaidInstallments = await prismaTenant.loanInstallment.count({
        where: {
          loanId: updatedInstallment.loanId,
          status: { not: 'PAID' },
        },
      });

      if (unpaidInstallments === 0) {
        await prismaTenant.loan.update({
          where: { id: updatedInstallment.loanId },
          data: {
            status: 'PAID_OFF',
            paidOffDate: new Date(paymentDate),
          },
        });
        console.log(`Pinjaman ${updatedInstallment.loanId} telah lunas.`);
      }

      return updatedInstallment;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Angsuran dengan ID ${installmentId} tidak ditemukan.`,
        );
      }
      console.error('Gagal mencatat pembayaran angsuran:', error);
      throw new Error('Gagal mencatat pembayaran angsuran.');
    }
  }
}
