import type { Repository } from "typeorm";
import type { Category } from "../entity/category.entity";

export class CategoryService {
  constructor(private categoryRepository: Repository<Category>) {}

  async findAll(
    whereParams: any = {},
    skip = 0,
    limit = 10
  ): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { ...whereParams },
      relations: ["events"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async findById(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ["events"],
    });
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: number,
    categoryData: Partial<Category>
  ): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) return null;

    this.categoryRepository.merge(category, categoryData);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.categoryRepository.delete({ id });
    return result.affected !== 0;
  }
}
