// src/public/public.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PublicService {
  private readonly prisma = new PrismaClient();

  async register(registerTenantDto: RegisterTenantDto) {
    const {
      subdomain,
      email,
      password,
      cooperativeName,
      // Detail Koperasi
      skAhuKoperasi,
      province,
      city,
      district,
      village,
      alamatLengkap,
      petaLokasi,
      // Detail PIC (Calon Admin)
      picFullName,
      picNik,
      picGender,
      picPlaceOfBirth,
      picDateOfBirth, // Ini masih string
      picOccupation,
      picAddress,
      picPhoneNumber,
      // Detail Dokumen
      dokPengesahanPendirianUrl,
      dokDaftarUmumUrl,
      dokAkteNotarisUrl,
      dokNpwpKoperasiUrl,
    } = registerTenantDto;

    // Cek duplikasi subdomain
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Nama subdomain sudah digunakan.');
    }

    // 2. Pengecekan Konflik (PERBAIKAN DI SINI)
    const existingRegistration = await this.prisma.tenantRegistration.findFirst(
      {
        where: {
          OR: [
            { email },
            { picNik: picNik }, // <-- Diubah dari pic_nik
            { picPhoneNumber: picPhoneNumber }, // <-- Diubah dari pic_phone_number
          ],
        },
      },
    );
    if (existingRegistration) {
      throw new ConflictException(
        'Email, NIK PIC, atau Nomor HP PIC sudah terdaftar.',
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const newTenant = await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: cooperativeName,
            subdomain,
            schemaName: `tenant_${subdomain}`,
            status: 'PENDING',
          },
        });

        // 3. Simpan data ke TenantRegistration (PERBAIKAN DI SINI)
        await tx.tenantRegistration.create({
          data: {
            // Data Koperasi
            cooperativeName,
            skAhuKoperasi,
            province,
            city,
            district,
            village,
            alamatLengkap,
            petaLokasi,
            // Data PIC (dipetakan ke nama camelCase)
            picFullName: picFullName,
            picNik: picNik,
            picGender: picGender,
            picPlaceOfBirth: picPlaceOfBirth,
            picDateOfBirth: new Date(picDateOfBirth),
            picOccupation: picOccupation,
            picAddress: picAddress,
            picPhoneNumber: picPhoneNumber,
            // Data Akun
            email,
            hashedPassword,
            // Data Dokumen
            dokPengesahanPendirian: dokPengesahanPendirianUrl,
            dokDaftarUmum: dokDaftarUmumUrl,
            dokAkteNotaris: dokAkteNotarisUrl,
            dokNpwpKoperasi: dokNpwpKoperasiUrl,
            // Relasi
            tenantId: tenant.id,
          },
        });
        return tenant;
      });

      return {
        message:
          'Pendaftaran berhasil. Silakan tunggu persetujuan dari Administrator.',
        tenantId: newTenant.id,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw new ConflictException(
        'Gagal melakukan pendaftaran, data mungkin duplikat.',
      );
    }
  }
}
