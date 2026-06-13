
import { Router } from "express";
import { scanPackage } from "../controllers/scanController.js";

const router = Router();

router.post("/", scanPackage);

export default router;
