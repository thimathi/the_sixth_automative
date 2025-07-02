import * as dashboardService from "../../services/md/dashboardService.js";

export const getDashboardData = async (req, res) => {
  try {
    console.log("Request query:", req.query);
    const { empId } = req.query;
    console.log("Extracted empId:", empId);

    if (!empId) {
      console.error("Employee ID is required");
      return res.status(400).json({
        error: "Employee ID is required",
        details: { receivedQuery: req.query },
      });
    }

    const data = await dashboardService.getDashboardData(empId);
    console.log("Dashboard data fetched successfully:", data);
    res.json(data);
  } catch (error) {
    console.error("Error in getDashboardData:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      error: error.message || "Failed to fetch dashboard data",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const scheduleMeeting = async (req, res) => {
  try {
    const { empId, meetingData } = req.body;

    // Basic validation
    if (!empId || !meetingData) {
      return res.status(400).json({
        error: "empId and meetingData are required",
      });
    }

    const result = await dashboardService.scheduleMeeting(empId, meetingData);

    res.status(201).json({
      success: true,
      meeting: result.meeting,
    });
  } catch (error) {
    console.error("Controller error in scheduleMeeting:", error);

    const statusCode = error.message.includes("Unauthorized")
      ? 403
      : error.message.includes("Missing")
      ? 400
      : 500;

    res.status(statusCode).json({
      error: error.message || "Failed to schedule meeting",
    });
  }
};

export const promoteEmployee = async (req, res) => {
  try {
    const { empId, promotionData } = req.body;
    const result = await dashboardService.promoteEmployee(empId, promotionData);
    res.json(result);
  } catch (error) {
    console.error("Error in promoteEmployee:", error);
    res.status(error.message.includes("Unauthorized") ? 403 : 500).json({
      error: error.message || "Failed to promote employee",
    });
  }
};
