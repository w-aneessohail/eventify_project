import type { Repository } from "typeorm";
import type { Category } from "../entity/category.entity";
import { VerificationStatus } from "../enum/verificationStatus.enum";

export class CategoryService {
  constructor(private categoryRepository: Repository<Category>) {}

  private filterPublicEvents(category: Category): Category {
    if (!category.events?.length) return category;
    category.events = category.events.filter(
      (event) =>
        event.status === VerificationStatus.APPROVED &&
        event.organizer?.verificationStatus === VerificationStatus.APPROVED
    );
    return category;
  }

  async findAll(
    whereParams: Record<string, unknown> = {},
    skip = 0,
    limit = 10,
    publicOnly = false
  ): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { ...whereParams },
      relations: ["events", "events.organizer"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return publicOnly
      ? categories.map((c) => this.filterPublicEvents(c))
      : categories;
  }

  async findById(id: number, publicOnly = false): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["events", "events.organizer"],
    });
    if (!category) return null;
    return publicOnly ? this.filterPublicEvents(category) : category;
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
