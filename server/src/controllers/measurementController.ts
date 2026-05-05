import { Request, Response, NextFunction } from "express";
import { Measurement } from "../models/Measurement";

// ✅ CREATE MEASUREMENT
// export const createMeasurement = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { label, chest, waist, shoulder, length, sleeve } = req.body;

//     const measurement = await Measurement.create({
//       userId: req.user.id,
//       label,
//       chest,
//       waist,
//       shoulder,
//       length,
//       sleeve,
//     });

//     res.status(201).json({
//       success: true,
//       data: measurement,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const createMeasurement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      label,
      upperBody,
      lowerBody,
      extras,
    } = req.body;

    const measurement = await Measurement.create({
      userId: req.user.id,
      label,
      upperBody,
      lowerBody,
      extras,
    });

    res.status(201).json({
      success: true,
      data: measurement,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET ALL MY MEASUREMENTS
export const getMyMeasurements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const measurements = await Measurement.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: measurements.length,
      data: measurements,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET SINGLE MEASUREMENT
export const getMeasurementById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    // 🔐 ownership check
    if (measurement.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: measurement,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE MEASUREMENT
// export const updateMeasurement = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const measurement = await Measurement.findById(req.params.id);

//     if (!measurement) {
//       return res.status(404).json({
//         success: false,
//         message: "Measurement not found",
//       });
//     }

//     // 🔐 ownership check
//     if (measurement.userId.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized",
//       });
//     }

//     const allowedFields = [
//       "label",
//       "chest",
//       "waist",
//       "shoulder",
//       "length",
//       "sleeve",
//     ];

//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         (measurement as any)[field] = req.body[field];
//       }
//     });

//     await measurement.save();

//     res.status(200).json({
//       success: true,
//       data: measurement,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const updateMeasurement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    if (measurement.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const updates: any = {};

    // ✅ label
    if (req.body.label !== undefined) {
      updates.label = req.body.label;
    }

    // ✅ upperBody fields
    if (req.body.upperBody) {
      Object.keys(req.body.upperBody).forEach((key) => {
        updates[`upperBody.${key}`] = req.body.upperBody[key];
      });
    }

    // ✅ lowerBody fields
    if (req.body.lowerBody) {
      Object.keys(req.body.lowerBody).forEach((key) => {
        updates[`lowerBody.${key}`] = req.body.lowerBody[key];
      });
    }

    // ✅ extras
    if (req.body.extras) {
      Object.keys(req.body.extras).forEach((key) => {
        updates[`extras.${key}`] = req.body.extras[key];
      });
    }

    const updatedMeasurement = await Measurement.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedMeasurement,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE MEASUREMENT
export const deleteMeasurement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    // 🔐 ownership check
    if (measurement.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await measurement.deleteOne();

    res.status(200).json({
      success: true,
      message: "Measurement deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getUserMeasurements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // 🔐 OPTIONAL: restrict to admin only
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view other users' measurements",
      });
    }

    const measurements = await Measurement.find({ userId })
      .select("_id label upperBody lowerBody extras") // ✅ keep response clean
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: measurements.length,
      data: measurements,
    });
  } catch (err) {
    next(err);
  }
};