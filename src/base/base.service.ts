import {
  FilterQuery,
  Model,
  ObjectId,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import BaseDocument from './base.document';

abstract class BaseService<T extends BaseDocument> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return entity.save();
  }

  findOneById(id: string | ObjectId) {
    return this.model.findById(id);
  }

  findOne(query: FilterQuery<T>) {
    return this.model.findOne(query);
  }

  async updateById(id: string | ObjectId, changes: Partial<T>) {
    const entity = await this.findOneById(id);
    entity.set(changes);

    return entity.save();
  }

  async update(query: FilterQuery<T>, changes: Partial<T>) {
    const entity = await this.findOne(query);
    entity.set(changes);

    return entity.save();
  }

  findOneAndUpdate(
    query: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
    options?: QueryOptions,
  ) {
    return this.model.findOneAndUpdate(query, updateQuery, options);
  }

  exists(query: FilterQuery<T>) {
    return this.model.exists(query);
  }
}

export default BaseService;
