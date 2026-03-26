import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Employee } from 'src/schemas/employee.schema';

import { CreateEmployeeDto } from './dto/create-employee';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeesOrderDto } from './dto/update-employees-order';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  @Get()
  async getAllProducts(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Patch('reorder')
  updateOrder(@Body() dto: UpdateEmployeesOrderDto) {
    return this.employeesService.updateOrder(dto);
  }
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createProduct(
    @Body()
    employee: CreateEmployeeDto
  ): Promise<Employee> {
    return this.employeesService.create(employee);
  }
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateProduct(
    @Param('id') id: string,
    @Body() employee: UpdateEmployeeDto
  ) {
    return this.employeesService.updateById(id, employee);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteProduct(
    @Param('id')
    id: string
  ): Promise<Employee> {
    return this.employeesService.deleteById(id);
  }
}
