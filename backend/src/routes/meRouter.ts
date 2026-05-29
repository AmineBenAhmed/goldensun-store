import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response, Router } from "express";
import { getLocalUser } from "../lib/users";

const router = Router();

//Since the me router has one single route the handler not moved to controller
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!userId || !isAuthenticated) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await getLocalUser(userId);

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
})

export default router;
