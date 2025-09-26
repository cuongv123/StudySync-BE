import{
    Column,
    Entity,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { User } from '../User/User.entity';

@Entity('tokens')
export class Token {
    @PrimaryGeneratedColumn("identity")
    id: number;

    @Column({
    type: 'simple-array',
    default: '',
    })
    refeshtokenused: String[];

    @Column()
    accessToken: String;

    @Column()
    refreshToken: String;

    @OneToOne (() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}