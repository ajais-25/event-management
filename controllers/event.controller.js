import { prisma } from "../prisma/index.js";

const createEvent = async (req, res) => {
  try {
    const { title, dateTime, location, capacity } = req.body;

    if (!title || !dateTime || !location || !capacity) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive number",
      });
    }

    if (capacity > 1000) {
      return res.status(400).json({
        success: false,
        message: "Capacity cannot exceed 1000",
      });
    }

    if (new Date(dateTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date cannot be in the past",
      });
    }

    // Convert dateTime to ISO string for Prisma
    if (isNaN(new Date(dateTime))) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Parse dateTime to ISO string
    const parseDate = new Date(dateTime).toISOString();

    const newEvent = await prisma.event.create({
      data: {
        title,
        dateTime: parseDate,
        location,
        capacity,
      },
    });

    res.status(201).json({
      success: true,
      eventId: newEvent.id,
      message: "Event created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create event" });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        dateTime: "asc",
      },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: events,
      message: "Events retrieved successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve events" });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!eventId || isNaN(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid event ID is required" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already registered for this event
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: parseInt(userId),
          eventId: parseInt(eventId),
        },
      },
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "User is already registered for this event",
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { registrations: true },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.dateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot register for past events",
      });
    }

    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event is fully booked",
      });
    }

    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        userId: parseInt(userId),
        eventId: parseInt(eventId),
      },
      include: {
        user: true,
        event: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        registrationId: registration.id,
        user: registration.user.name,
        event: registration.event.title,
      },
      message: "Registered for event successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register for event",
    });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!eventId || isNaN(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid event ID is required" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Find the registration to cancel
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: parseInt(userId),
          eventId: parseInt(eventId),
        },
      },
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Delete the registration
    await prisma.registration.delete({
      where: {
        id: registration.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel registration",
    });
  }
};

const upcomingEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        dateTime: {
          gte: new Date(),
        },
      },
      orderBy: [
        {
          dateTime: "asc",
        },
        {
          location: "asc",
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: events,
      message: "Upcoming events retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve upcoming events",
    });
  }
};

const eventStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId || isNaN(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid event ID is required" });
    }

    const stats = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const remainingCapacity = stats.capacity - stats.registrations.length;
    const percentageOfCapacityUsed =
      (stats.registrations.length / stats.capacity) * 100;

    const response = {
      totalRegistrations: stats.registrations.length,
      remainingCapacity,
      percentageOfCapacityUsed: percentageOfCapacityUsed.toFixed(2),
    };

    res.status(200).json({
      success: true,
      data: response,
      message: "Event statistics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve event statistics",
    });
  }
};

export {
  createEvent,
  getEvents,
  registerForEvent,
  cancelRegistration,
  upcomingEvents,
  eventStats,
};
