import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  @Get()
  async getAllProducts(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }
  @Post()
  @UseGuards(AuthGuard())
  async createProduct(
    @Body()
    employee: CreateEmployeeDto
  ): Promise<Employee> {
    return this.employeesService.create(employee);
  }
  @Put(':id')
  @UseGuards(AuthGuard())
  async updateProduct(
    @Param('id') id: string,
    @Body() employee: UpdateEmployeeDto
  ) {
    return this.employeesService.updateById(id, employee);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteProduct(
    @Param('id')
    id: string
  ): Promise<Employee> {
    return this.employeesService.deleteById(id);
  }
}
