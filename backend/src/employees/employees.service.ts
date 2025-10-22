// backend/src/employees/employees.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee, Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Membuat data karyawan baru.
   * Nomor karyawan (employeeNumber) dibuat otomatis oleh database.
   */
  async create(createDto: CreateEmployeeDto): Promise<Employee> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { dateOfBirth, hireDate, ...restData } = createDto;

    try {
      const newEmployee: Employee = await prismaTenant.employee.create({
        data: {
          ...restData,
          dateOfBirth: new Date(dateOfBirth),
          hireDate: new Date(hireDate),
        },
        // Langsung sertakan nama approver jika sudah ada (meski saat create belum ada)
        include: {
          approvedByPengurus: { select: { fullName: true } },
          approvedByKetua: { select: { fullName: true } },
        },
      });
      return newEmployee;
    } catch (error) {
      console.error('Gagal membuat data karyawan:', error);
      // Di production, sebaiknya gunakan logger service
      throw new Error('Gagal menyimpan data karyawan baru.');
    }
  }

  /**
   * Mengambil semua data karyawan, diurutkan berdasarkan nomor urut.
   * Termasuk data Pengurus dan Ketua yang melakukan approval.
   */
  async findAll(): Promise<Employee[]> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const employees: Employee[] = await prismaTenant.employee.findMany({
      orderBy: {
        employeeNumber: 'asc',
      },
      include: {
        approvedByPengurus: { select: { fullName: true } }, // Tampilkan nama Pengurus approver
        approvedByKetua: { select: { fullName: true } }, // Tampilkan nama Ketua approver
      },
    });
    return employees;
  }

  /**
   * Mengambil detail satu karyawan berdasarkan ID unik (UUID).
   * Termasuk data Pengurus dan Ketua yang melakukan approval.
   */
  async findOne(id: string): Promise<Employee> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const employee: Employee = await prismaTenant.employee.findUniqueOrThrow({
        where: { id },
        include: {
          approvedByPengurus: { select: { fullName: true } },
          approvedByKetua: { select: { fullName: true } },
        },
      });
      return employee;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025' // Kode Prisma untuk "Record not found"
      ) {
        throw new NotFoundException(
          `Karyawan dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari karyawan ${id}:`, error);
      throw new Error('Gagal mengambil data karyawan.');
    }
  }

  /**
   * Memperbarui data karyawan berdasarkan ID.
   * Tidak termasuk field approval (gunakan method terpisah).
   */
  async update(id: string, updateDto: UpdateEmployeeDto): Promise<Employee> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    // Pisahkan field tanggal dan data lainnya
    const {
      dateOfBirth,
      hireDate,
      terminationDate,
      terminationReason,
      ...restData
    } = updateDto;

    // Siapkan data yang akan diupdate
    const dataToUpdate: Prisma.EmployeeUpdateInput = {
      ...restData,
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(hireDate && { hireDate: new Date(hireDate) }),
    };

    // Handle update data berhenti secara eksplisit
    if (terminationDate !== undefined) {
      dataToUpdate.terminationDate = terminationDate
        ? new Date(terminationDate)
        : null;
      // Jika tanggal berhenti di-set null, alasan juga jadi null
      if (terminationDate === null) {
        dataToUpdate.terminationReason = null;
      } else if (terminationReason !== undefined) {
        // Hanya update alasan jika tanggal berhenti tidak null
        dataToUpdate.terminationReason = terminationReason;
      }
    } else if (terminationReason !== undefined) {
      // Jika hanya alasan yang dikirim (tanpa tanggal), update alasan saja (jika tanggal sudah ada)
      dataToUpdate.terminationReason = terminationReason;
    }

    try {
      const updatedEmployee: Employee = await prismaTenant.employee.update({
        where: { id },
        data: dataToUpdate,
        include: {
          // Sertakan approver dalam response update
          approvedByPengurus: { select: { fullName: true } },
          approvedByKetua: { select: { fullName: true } },
        },
      });
      return updatedEmployee;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Karyawan dengan ID ${id} tidak ditemukan saat mencoba update.`,
        );
      }
      console.error(`Gagal mengupdate karyawan ${id}:`, error);
      throw new Error('Gagal mengupdate data karyawan.');
    }
  }

  /**
   * Memberhentikan karyawan (soft delete) dengan mengisi tanggal dan alasan berhenti.
   */
  async remove(
    id: string,
    reason: string = 'Diberhentikan',
  ): Promise<Employee> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      // Pastikan karyawan ada sebelum update
      await this.findOne(id); // Akan throw NotFoundException jika tidak ada

      const updatedEmployee = await prismaTenant.employee.update({
        where: { id },
        data: {
          terminationDate: new Date(), // Set tanggal berhenti ke waktu sekarang
          terminationReason: reason,
        },
        include: {
          // Sertakan approver dalam response
          approvedByPengurus: { select: { fullName: true } },
          approvedByKetua: { select: { fullName: true } },
        },
      });
      return updatedEmployee;
    } catch (error: unknown) {
      // Error NotFound sudah ditangani oleh findOne
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Karyawan dengan ID ${id} tidak ditemukan untuk diberhentikan.`,
        );
      }
      console.error(`Gagal memberhentikan karyawan ${id}:`, error);
      throw new Error('Gagal memberhentikan karyawan.');
    }
  }

  /**
   * Mencatat persetujuan data karyawan oleh seorang Pengurus.
   * @param id ID Karyawan (UUID)
   * @param pengurusUserId ID User Pengurus yang melakukan approval
   */
  async approveByPengurus(
    id: string,
    pengurusUserId: string,
  ): Promise<Employee> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Verifikasi karyawan ada
    await this.findOne(id);

    // Verifikasi apakah pengurusUserId valid (opsional, tergantung kebutuhan)
    // const pengurus = await prismaTenant.user.findUnique({ where: { id: pengurusUserId }});
    // if (!pengurus) throw new NotFoundException(`User Pengurus dengan ID ${pengurusUserId} tidak ditemukan.`);

    try {
      const approvedEmployee = await prismaTenant.employee.update({
        where: { id },
        data: {
          approvedByPengurusId: pengurusUserId,
        },
        include: {
          // Sertakan approver dalam response
          approvedByPengurus: { select: { fullName: true } },
          approvedByKetua: { select: { fullName: true } },
        },
      });
      return approvedEmployee;
    } catch (error) {
      console.error(`Gagal approve pengurus untuk karyawan ${id}:`, error);
      throw new Error('Gagal memproses persetujuan pengurus.');
    }
  }

  /**
   * Mencatat persetujuan data karyawan oleh Ketua.
   * @param id ID Karyawan (UUID)
   * @param ketuaUserId ID User Ketua yang melakukan approval
   */
  async approveByKetua(id: string, ketuaUserId: string): Promise<Employee> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Verifikasi karyawan ada
    await this.findOne(id);

    // Verifikasi apakah ketuaUserId valid (opsional)
    // const ketua = await prismaTenant.user.findUnique({ where: { id: ketuaUserId }});
    // if (!ketua) throw new NotFoundException(`User Ketua dengan ID ${ketuaUserId} tidak ditemukan.`);
    // TODO: Tambahkan validasi role/jabatan Ketua jika diperlukan

    try {
      const approvedEmployee = await prismaTenant.employee.update({
        where: { id },
        data: {
          approvedByKetuaId: ketuaUserId,
          ketuaApprovalDate: new Date(), // Set tanggal approval
        },
        include: {
          // Sertakan approver dalam response
          approvedByPengurus: { select: { fullName: true } },
          approvedByKetua: { select: { fullName: true } },
        },
      });
      return approvedEmployee;
    } catch (error) {
      console.error(`Gagal approve ketua untuk karyawan ${id}:`, error);
      throw new Error('Gagal memproses persetujuan ketua.');
    }
  }
}
