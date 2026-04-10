import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { Request } from './entities/request.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { UserRole } from 'src/users/enums/user.enums';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { RequestStatus } from './enums/request.enums';
import { NotificationsGateway } from 'src/notification/notifications.gateway';
import { NOTIFICATION_MESSAGES } from 'src/notification/constants/notification-messages';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(senderId: string, dto: CreateRequestDto) {
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const requestedSkill = await this.skillsRepository.findOne({
      where: { id: dto.requestedSkillId },
      relations: { owner: true },
    });

    if (!requestedSkill) {
      throw new NotFoundException(ERROR_MESSAGES.REQUESTED_SKILL_NOT_FOUND);
    }

    const offeredSkill = await this.skillsRepository.findOne({
      where: { id: dto.offeredSkillId },
      relations: { owner: true },
    });

    if (!offeredSkill) {
      throw new NotFoundException(ERROR_MESSAGES.OFFERED_SKILL_NOT_FOUND);
    }

    if (!offeredSkill.owner || offeredSkill.owner.id !== senderId) {
      throw new ForbiddenException(ERROR_MESSAGES.OFFERED_SKILL_NOT_OWNED);
    }

    const receiver = requestedSkill.owner;
    if (!receiver) {
      throw new BadRequestException(
        ERROR_MESSAGES.REQUESTED_SKILL_OWNER_MISSING,
      );
    }

    if (receiver.id === senderId) {
      throw new BadRequestException(ERROR_MESSAGES.CANNOT_SEND_REQUEST_TO_SELF);
    }

    const request = this.requestsRepository.create({
      sender,
      receiver,
      offeredSkill,
      requestedSkill,
    });

    const saved = await this.requestsRepository.save(request);

    const savedRequest = await this.requestsRepository.findOne({
      where: { id: saved.id },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
    });

    if (!savedRequest) {
      throw new NotFoundException(ERROR_MESSAGES.REQUEST_NOT_FOUND);
    }

    this.notificationsGateway.notifyNewRequest(savedRequest.receiver.id, {
      message: NOTIFICATION_MESSAGES.NEW_REQUEST(savedRequest.sender.name),
      skillTitle: savedRequest.requestedSkill.title,
      fromUser: savedRequest.sender.name,
    });

    return savedRequest;
  }

  findAll() {
    return `This action returns all requests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  async remove(id: string, actorId: string, actorRole: UserRole) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: { sender: true },
    });

    if (!request) {
      throw new NotFoundException(ERROR_MESSAGES.REQUEST_NOT_FOUND);
    }

    const isAdmin = actorRole === UserRole.ADMIN;
    if (!isAdmin && request.sender?.id !== actorId) {
      throw new ForbiddenException(ERROR_MESSAGES.REQUEST_DELETE_ONLY_OUTGOING);
    }

    await this.requestsRepository.delete(id);

    return { id };
  }

  async getIncoming(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: { receiver: { id: userId } },
      relations: {
        sender: true,
        offeredSkill: true,
        requestedSkill: true,
      },
    });
  }

  async getOutgoing(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        sender: { id: userId },
      },
      relations: {
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
    });
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateRequestStatusDto,
  ): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: {
        receiver: true,
        sender: true,
        requestedSkill: true,
      },
    });

    if (!request) {
      throw new NotFoundException(ERROR_MESSAGES.REQUEST_NOT_FOUND);
    }

    if (request.receiver.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.REQUEST_UPDATE_ONLY_INCOMING);
    }

    request.status = dto.status;

    await this.requestsRepository.save(request);

    if (request.status === RequestStatus.ACCEPTED) {
      this.notificationsGateway.notifyRequestAccepted(request.sender.id, {
        message: NOTIFICATION_MESSAGES.REQUEST_ACCEPTED(request.receiver.name),
        skillTitle: request.requestedSkill.title,
        fromUser: request.receiver.name,
      });
    }

    if (request.status === RequestStatus.REJECTED) {
      this.notificationsGateway.notifyRequestRejected(request.sender.id, {
        message: NOTIFICATION_MESSAGES.REQUEST_REJECTED(request.receiver.name),
        skillTitle: request.requestedSkill.title,
        fromUser: request.receiver.name,
      });
    }

    return request;
  }
}
