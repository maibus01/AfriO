import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";

import { getAllUsers } from "../controllers/userController";
import { getAllBusinesses } from "../controllers/businessController";
import { getAllProductsAdmin } from "../controllers/productController";
import { getAllStylesAdmin } from "../controllers/styleController";


const router = express.Router();

// 🔐 ALL ADMIN ROUTES
router.use(protect, restrictTo("admin"));

// USERS
router.get("/users", getAllUsers);

// BUSINESSES
router.get("/businesses", getAllBusinesses);

// PRODUCTS
router.get("/products", getAllProductsAdmin);
router.get("/styles", getAllStylesAdmin);

export default router;