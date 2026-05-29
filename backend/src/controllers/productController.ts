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

