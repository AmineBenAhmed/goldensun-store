import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { products } from "../db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function listProducts(req: Request, res: Response, next: NextFunction) {

  try {
    const cat = typeof req.query.category === "string" ? req.query.category.trim() : "";

    const activeonly = eq(products.active, true);
    const whereClause = cat ? and(activeonly, eq(products.category, cat)) : activeonly;

    const rows = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))

    res.json({ products: rows });
  } catch (error) {
    next(error)
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db
      .select({ category: products.category })
      .from(products)
      .where(eq(products.active, true));

    const categories = [...new Set(rows.map(row => row.category))].sort((a,b) => a.localeCompare(b));
    res.json({ categories });
  } catch (error) {
    next(error)
  }
}

export async function getProductsBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, req.params.slug as string), eq(products.active, true)))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json({ product: row });
    }
  } catch (error) {
    next(error)
  }
}

