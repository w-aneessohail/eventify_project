import * as express from "express";
import { CategoryController } from "../controller/category.controller";
import { authentication } from "../middleware/authentication";
import { optionalAuthentication } from "../middleware/optionalAuthentication";
import { UserRole } from "../enum/userRole.enum";
import { authorization } from "../middleware/authorization";
import { CreateCategoryValidator } from "../middleware/validator/createCategory.validator";

const Router = express.Router();

Router.get("/categories", optionalAuthentication, CategoryController.getAllCategories);
Router.get("/categories/:id", optionalAuthentication, CategoryController.getCategoryById);
Router.post(
  "/categories",
  authentication,
  authorization([UserRole.ADMIN]),
  CreateCategoryValidator,
  CategoryController.createCategory
);
Router.put(
  "/categories/:id",
  authentication,
  authorization([UserRole.ADMIN]),
  CategoryController.updateCategory
);
Router.delete(
  "/categories/:id",
  authentication,
  authorization([UserRole.ADMIN]),
  CategoryController.deleteCategory
);

export { Router as categoryRouter };
