import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MultiLanguageString } from 'src/common/types/language.types';
import { Employee } from 'src/schemas/employee.schema';
import { TranslationService } from 'src/translation/translation.service';

import { CreateEmployeeDto } from './dto/create-employee';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeesOrderDto } from './dto/update-employees-order';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
    private readonly translationService: TranslationService
  ) {}

  async findAll() {
    return this.employeeModel.find().sort({ order: 1 });
  }

  async updateOrder(dto: UpdateEmployeesOrderDto) {
    const operations = dto.employees.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await this.employeeModel.bulkWrite(operations);

    return { message: 'Employees order updated successfully' };
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const name = await this.translationService.translateEmployeeText(
      dto.name,
      'en',
      'name'
    );

    const description = await this.translationService.translateEmployeeText(
      dto.description,
      'en',
      'description'
    );

    return this.employeeModel.create({
      ...dto,
      name,
      description,
    });
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
