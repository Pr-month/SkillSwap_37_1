import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthRequest } from 'src/auth/types/auth.types';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: AuthRequest, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.sub, dto);
  }

  @Get('incoming')
  @UseGuards(JwtAuthGuard)
  getIncoming(@Request() req: AuthRequest) {
    return this.requestsService.getIncoming(req.user.sub);
  }

  @Get('outgoing')
  @UseGuards(JwtAuthGuard)
  getOutgoing(@Request() req: AuthRequest) {
    return this.requestsService.getOutgoing(req.user.sub);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateStatus(id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.requestsService.remove(id, req.user.sub, req.user.role);
  }
}
