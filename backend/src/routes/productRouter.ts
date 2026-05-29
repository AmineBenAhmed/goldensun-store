import { Router } from "express";
import { listProducts } from "../controllers/productController";

const router = Router();

router.get("/", listProducts);
router.get("cartegories", getCategories);
router.get("/:slug", getProductsBySlug);

export default router;
