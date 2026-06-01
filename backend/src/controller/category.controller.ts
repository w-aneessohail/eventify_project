import type { Request, Response } from "express";
import { categoryRepository } from "../repository";

export class CategoryController {
  static async getAllCategories(req: Request, res: Response) {
    try {
      const { skip = 0, limit = 10, ...whereParams } = req.query;
      const categories = await categoryRepository.findAll(
        whereParams,
        Number(skip),
        Number(limit)
      );
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const category = await categoryRepository.findById(id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Error fetching category" });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const newCategory = await categoryRepository.createCategory(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Error creating category" });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updatedCategory = await categoryRepository.updateCategory(
        id,
        req.body
      );
      if (!updatedCategory)
        return res.status(404).json({ message: "Category not found" });
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Error updating category" });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await categoryRepository.deleteCategory(id);
      if (!deleted)
        return res.status(404).json({ message: "Category not found" });
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Error deleting category" });
    }
  }
}
