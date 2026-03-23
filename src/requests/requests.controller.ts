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
import {
  ApiCreateRequest,
  ApiGetIncomingRequests,
  ApiGetOutgoingRequests,
  ApiGetAllRequests,
  ApiGetRequestById,
  ApiUpdateRequestStatus,
  ApiDeleteRequest,
} from './swagger/requests.swagger';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreateRequest()
  create(@Request() req: AuthRequest, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.sub, dto);
  }

  @Get('incoming')
  @UseGuards(JwtAuthGuard)
  @ApiGetIncomingRequests()
  getIncoming(@Request() req: AuthRequest) {
    return this.requestsService.getIncoming(req.user.sub);
  }

  @Get('outgoing')
  @UseGuards(JwtAuthGuard)
  @ApiGetOutgoingRequests()
  getOutgoing(@Request() req: AuthRequest) {
    return this.requestsService.getOutgoing(req.user.sub);
  }

  @Get()
  @ApiGetAllRequests()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  @ApiGetRequestById()
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateRequestStatus()
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateStatus(id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiDeleteRequest()
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.requestsService.remove(id, req.user.sub, req.user.role);
  }
}
