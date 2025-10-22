import { Injectable } from '@nestjs/common';
import { CreateBoardMeetingNoteDto } from './dto/create-board-meeting-note.dto';
import { UpdateBoardMeetingNoteDto } from './dto/update-board-meeting-note.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BoardMeetingNote, Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class BoardMeetingNotesService {
  constructor(private prisma: PrismaService) {} // Inject PrismaService

  async create(
    createDto: CreateBoardMeetingNoteDto,
  ): Promise<BoardMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { meetingDate, ...restData } = createDto;

    try {
      const newNote: BoardMeetingNote =
        await prismaTenant.boardMeetingNote.create({
          data: {
            ...restData,
            meetingDate: new Date(meetingDate),
          },
        });
      return newNote;
    } catch (error) {
      console.error('Gagal membuat notulen rapat pengurus:', error);
      throw new Error('Gagal menyimpan notulen rapat pengurus baru.');
    }
  }

  async findAll(): Promise<BoardMeetingNote[]> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const notes: BoardMeetingNote[] =
      await prismaTenant.boardMeetingNote.findMany({
        orderBy: {
          meetingDate: 'desc',
        },
      });
    return notes;
  }

  async findOne(id: string): Promise<BoardMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const note: BoardMeetingNote =
        await prismaTenant.boardMeetingNote.findUniqueOrThrow({
          where: { id },
        });
      return note;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat pengurus dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari notulen ${id}:`, error);
      throw new Error('Gagal mengambil data notulen rapat pengurus.');
    }
  }

  async update(
    id: string,
    updateDto: UpdateBoardMeetingNoteDto,
  ): Promise<BoardMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { meetingDate, ...restData } = updateDto;

    try {
      const updatedNote: BoardMeetingNote =
        await prismaTenant.boardMeetingNote.update({
          where: { id },
          data: {
            ...restData,
            // Update tanggal hanya jika ada di DTO
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
          `Notulen rapat pengurus dengan ID ${id} tidak ditemukan saat mencoba update.`,
        );
      }
      console.error(`Gagal mengupdate notulen ${id}:`, error);
      throw new Error('Gagal mengupdate data notulen rapat pengurus.');
    }
  }

  async remove(id: string): Promise<BoardMeetingNote> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedNote: BoardMeetingNote =
        await prismaTenant.boardMeetingNote.delete({
          where: { id },
        });
      return deletedNote;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notulen rapat pengurus dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus notulen ${id}:`, error);
      throw new Error('Gagal menghapus data notulen rapat pengurus.');
    }
  }
}
