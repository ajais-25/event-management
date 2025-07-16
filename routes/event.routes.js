import {
  createEvent,
  getEvents,
  registerForEvent,
  cancelRegistration,
  upcomingEvents,
  eventStats,
} from "../controllers/event.controller.js";
import { Router } from "express";

const router = Router();

router.post("/create", createEvent);
router.get("/", getEvents);
router.post("/register/:eventId", registerForEvent);
router.post("/cancel/:eventId", cancelRegistration);
router.get("/upcoming", upcomingEvents);
router.get("/stats/:eventId", eventStats);

export default router;
