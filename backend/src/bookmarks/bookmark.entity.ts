import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, ManyToMany, JoinTable, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Tag } from '../tags/tag.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  url: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'text' })
  favicon: string | null;

  @Column({ nullable: true, type: 'text' })
  previewImage: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable({
    name: 'bookmark_tags',
    joinColumn: { name: 'bookmarkId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags: Tag[];
}
