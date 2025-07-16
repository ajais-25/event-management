import { prisma } from "../prisma/index.js";

const register = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Name and email are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "User registration failed" });
  }
};

export { register };
