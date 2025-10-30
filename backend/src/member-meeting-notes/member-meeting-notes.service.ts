// backend/src/member-meeting-notes/member-meeting-notes.service.ts
import {
  Injectable,
  NotFoundException,
  Inject, // <-- TAMBAHKAN
  Scope, // <-- TAMBAHKAN
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMemberMeetingNoteDto } from './dto/create-member-meeting-note.dto';
import { UpdateMemberMeetingNoteDto } from './dto/update-member-meeting-note.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Impor PrismaService
import { MemberMeetingNote, Prisma, PrismaClient } from '@prisma/client'; // Impor tipe
import { UploadsService } from 'src/uploads/uploads.service'; // <-- TAMBAHKAN
import { REQUEST } from '@nestjs/core'; // <-- TAMBAHKAN
import type { Request } from 'express';
@Injectable({ scope: Scope.REQUEST })
export class MemberMeetingNotesService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService, // <-- TAMBAHKAN
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(
    createDto: CreateMemberMeetingNoteDto,
  ): Promise<MemberMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { meetingDate, ...restData } = createDto;

    try {
      const newNote: MemberMeetingNote =
        await prismaTenant.memberMeetingNote.create({
          data: {
            ...restData,
            meetingDate: new Date(meetingDate), // Konversi string tanggal ke Date
          },
        });
      return newNote;
    } catch (error) {
      console.error('Gagal membuat notulen rapat anggota:', error);
      throw new Error('Gagal menyimpan notulen rapat anggota baru.');
    }
  }

  async findAll(): Promise<MemberMeetingNote[]> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const notes: MemberMeetingNote[] =
      await prismaTenant.memberMeetingNote.findMany({
        orderBy: {
          meetingDate: 'desc', // Urutkan berdasarkan tanggal rapat terbaru
        },
      });
    return notes;
  }

  async findOne(id: string): Promise<MemberMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const note: MemberMeetingNote =
        await prismaTenant.memberMeetingNote.findUniqueOrThrow({
          where: { id },
        });
      return note;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat anggota dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari notulen ${id}:`, error);
      throw new Error('Gagal mengambil data notulen rapat anggota.');
    }
  }

  async update(
    id: string,
    updateDto: UpdateMemberMeetingNoteDto,
  ): Promise<MemberMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { meetingDate, ...restData } = updateDto;

    try {
      const updatedNote: MemberMeetingNote =
        await prismaTenant.memberMeetingNote.update({
          where: { id },
          data: {
            ...restData,
            ...(meetingDate && { meetingDate: new Date(meetingDate) }), // Update tanggal jika ada
          },
        });
      return updatedNote;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat anggota dengan ID ${id} tidak ditemukan saat mencoba update.`,
        );
      }
      console.error(`Gagal mengupdate notulen ${id}:`, error);
      throw new Error('Gagal mengupdate data notulen rapat anggota.');
    }
  }

  async remove(id: string): Promise<MemberMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      // findUniqueOrThrow akan error jika tidak ditemukan
      const deletedNote: MemberMeetingNote =
        await prismaTenant.memberMeetingNote.delete({
          where: { id },
        });
      return deletedNote;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat anggota dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus notulen ${id}:`, error);
      throw new Error('Gagal menghapus data notulen rapat anggota.');
    }
  }
  /**
   * (Pengurus) Mengunggah atau memperbarui file dokumen notulen.
   */
  async updateDocument(
    id: string,
    file: Express.Multer.File,
  ): Promise<MemberMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const tenantId = this.request.tenantId;

    if (!tenantId) {
      throw new InternalServerErrorException(
        'Tenant ID tidak ditemukan untuk upload dokumen notulen.',
      );
    }

    // 1. Pastikan notulen ada & ambil URL lama (jika ada)
    const currentNote = await this.findOne(id);
    const oldDocumentUrl = currentNote.documentUrl;

    // 2. Tentukan folder path
    const folderPath = `tenants/${tenantId}/member-meeting-notes/${id}`;

    try {
      // 3. Upload file baru
      const { url } = await this.uploadsService.uploadFile(file, folderPath);

      // 4. Update URL di database
      const updatedNote = await prismaTenant.memberMeetingNote.update({
        where: { id: id },
        data: { documentUrl: url },
      });

      // 5. Hapus file lama SETELAH upload & update DB sukses
      if (oldDocumentUrl && oldDocumentUrl !== url) {
        await this.uploadsService.deleteFile(oldDocumentUrl).catch((err) => {
          console.error(
            `[MemberMeetingNotesService] Gagal hapus dokumen lama ${oldDocumentUrl} untuk ID ${id}:`,
            err,
          );
          // Jangan gagalkan proses utama jika hapus file lama gagal
        });
      }

      return updatedNote;
    } catch (error) {
      console.error(`Gagal upload dokumen notulen ${id}:`, error);
      if (error instanceof NotFoundException) throw error; // Dari findOneById
      throw new InternalServerErrorException(
        'Gagal mengunggah dokumen notulen.',
      );
    }
  }
}
