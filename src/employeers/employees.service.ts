import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';
import { Employee } from 'src/schemas/employee.schema';

import { CreateEmployeeDto } from './dto/create-employee';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>
  ) {}

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().exec();
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const payload = {
      ...createEmployeeDto,
      name: { en: createEmployeeDto.name } as MultiLanguageString,
      description: { en: createEmployeeDto.description } as MultiLanguageString,
    };

    const createdEmployee = new this.employeeModel(payload);
    return createdEmployee.save();
  }

  async updateById(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto
  ): Promise<Employee> {
    const updatedEmployee = await this.employeeModel
      .findByIdAndUpdate(id, updateEmployeeDto, { new: true })
      .exec();

    if (!updatedEmployee) {
      throw new NotFoundException('Employee not found');
    }

    return updatedEmployee;
  }

  async deleteById(id: string): Promise<Employee> {
    const deletedEmployee = await this.employeeModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedEmployee) {
      throw new NotFoundException('Employee not found');
    }

    return deletedEmployee;
  }
}
