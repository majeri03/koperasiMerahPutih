// backend/src/supervisory-meeting-notes/supervisory-meeting-notes.service.ts
import {
  Injectable,
  NotFoundException,
  Inject, // <-- TAMBAHKAN
  Scope, // <-- TAMBAHKAN
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Sesuaikan path
import { CreateSupervisoryMeetingNoteDto } from './dto/create-supervisory-meeting-note.dto';
import { UpdateSupervisoryMeetingNoteDto } from './dto/update-supervisory-meeting-note.dto';
import { SupervisoryMeetingNote, Prisma, PrismaClient } from '@prisma/client'; // Impor tipe
import { UploadsService } from 'src/uploads/uploads.service'; // <-- TAMBAHKAN
import { REQUEST } from '@nestjs/core'; // <-- TAMBAHKAN
import type { Request } from 'express';
@Injectable({ scope: Scope.REQUEST })
export class SupervisoryMeetingNotesService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(
    createDto: CreateSupervisoryMeetingNoteDto,
  ): Promise<SupervisoryMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { meetingDate, ...restData } = createDto;

    try {
      const newNote: SupervisoryMeetingNote =
        await prismaTenant.supervisoryMeetingNote.create({
          data: {
            ...restData,
            meetingDate: new Date(meetingDate),
          },
        });
      return newNote;
    } catch (error) {
      console.error('Gagal membuat notulen rapat pengawas:', error);
      throw new Error('Gagal menyimpan notulen rapat pengawas baru.');
    }
  }

  async findAll(): Promise<SupervisoryMeetingNote[]> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const notes: SupervisoryMeetingNote[] =
      await prismaTenant.supervisoryMeetingNote.findMany({
        orderBy: {
          meetingDate: 'desc',
        },
      });
    return notes;
  }

  async findOne(id: string): Promise<SupervisoryMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const note: SupervisoryMeetingNote =
        await prismaTenant.supervisoryMeetingNote.findUniqueOrThrow({
          where: { id },
        });
      return note;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat pengawas dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari notulen ${id}:`, error);
      throw new Error('Gagal mengambil data notulen rapat pengawas.');
    }
  }

  async update(
    id: string,
    updateDto: UpdateSupervisoryMeetingNoteDto,
  ): Promise<SupervisoryMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { meetingDate, ...restData } = updateDto;

    try {
      const updatedNote: SupervisoryMeetingNote =
        await prismaTenant.supervisoryMeetingNote.update({
          where: { id },
          data: {
            ...restData,
            ...(meetingDate && { meetingDate: new Date(meetingDate) }),
          },
        });
      return updatedNote;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat pengawas dengan ID ${id} tidak ditemukan saat mencoba update.`,
        );
      }
      console.error(`Gagal mengupdate notulen ${id}:`, error);
      throw new Error('Gagal mengupdate data notulen rapat pengawas.');
    }
  }

  async remove(id: string): Promise<SupervisoryMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedNote: SupervisoryMeetingNote =
        await prismaTenant.supervisoryMeetingNote.delete({
          where: { id },
        });
      return deletedNote;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat pengawas dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus notulen ${id}:`, error);
      throw new Error('Gagal menghapus data notulen rapat pengawas.');
    }
  }

  /**
   * (Pengurus) Mengunggah atau memperbarui file dokumen notulen pengawas.
   */
  async updateDocument(
    id: string,
    file: Express.Multer.File,
  ): Promise<SupervisoryMeetingNote> {
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
    const folderPath = `tenants/${tenantId}/supervisory-meeting-notes/${id}`;

    try {
      // 3. Upload file baru
      const { url } = await this.uploadsService.uploadFile(file, folderPath);

      // 4. Update URL di database
      const updatedNote = await prismaTenant.supervisoryMeetingNote.update({
        where: { id: id },
        data: { documentUrl: url },
      });

      // 5. Hapus file lama SETELAH upload & update DB sukses
      if (oldDocumentUrl && oldDocumentUrl !== url) {
        await this.uploadsService.deleteFile(oldDocumentUrl).catch((err) => {
          console.error(
            `[SupervisoryNotesService] Gagal hapus dokumen lama ${oldDocumentUrl} untuk ID ${id}:`,
            err,
          );
          // Jangan gagalkan proses utama
        });
      }

      return updatedNote;
    } catch (error) {
      console.error(`Gagal upload dokumen notulen pengawas ${id}:`, error);
      if (error instanceof NotFoundException) throw error; // Dari findOneById
      throw new InternalServerErrorException(
        'Gagal mengunggah dokumen notulen.',
      );
    }
  }
}
