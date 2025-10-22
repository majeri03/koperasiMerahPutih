// backend/src/supervisory-meeting-notes/supervisory-meeting-notes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Sesuaikan path
import { CreateSupervisoryMeetingNoteDto } from './dto/create-supervisory-meeting-note.dto';
import { UpdateSupervisoryMeetingNoteDto } from './dto/update-supervisory-meeting-note.dto';
import { SupervisoryMeetingNote, Prisma, PrismaClient } from '@prisma/client'; // Impor tipe

@Injectable()
export class SupervisoryMeetingNotesService {
  constructor(private prisma: PrismaService) {}

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
}
