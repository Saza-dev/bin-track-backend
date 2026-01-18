import Waste from "../models/Waste.js";
import Composte from "../models/Composte.js";
import PDFDocument from "pdfkit";

// Helper to build filter object for MongoDB
const buildFilter = (startDate, endDate, location) => {
  let filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  // Apply location filter if it's not "all"
  if (location && location !== "all") {
    filter.location = location;
  }
  return filter;
};

export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate, type, location } = req.query;
    const filter = buildFilter(startDate, endDate, location); // Use the helper

    let wasteData = [];
    let compostData = [];

    if (type === "waste") {
      wasteData = await Waste.find(filter);
    } else if (type === "composte") {
      compostData = await Composte.find(filter);
    } else {
      [wasteData, compostData] = await Promise.all([
        Waste.find(filter),
        Composte.find(filter),
      ]);
    }

    const totals = { food: 0, paper: 0, polyethene: 0, eWaste: 0, medical: 0 };

    wasteData.forEach((entry) => {
      // Accessing nested 'weights' object
      const w = entry.weights || {};
      totals.food += w.food || 0;
      totals.paper += w.papper || 0;
      totals.polyethene += w.polyethene || 0;
      totals.eWaste += w.eWaste || 0;
      totals.medical += w.medicalWaste || 0;
    });

    compostData.forEach((entry) => {
      const category = entry.wasteType?.toLowerCase();
      if (category === "food") totals.food += entry.weight || 0;
      if (category === "paper") totals.paper += entry.weight || 0;
      if (category === "polyethene") totals.polyethene += entry.weight || 0;
      if (category === "e-waste") totals.eWaste += entry.weight || 0;
      if (category === "medical waste") totals.medical += entry.weight || 0;
    });

    res.json({ success: true, totals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const downloadReport = async (req, res) => {
  try {
    const { type, startDate, endDate, location } = req.query;
    const filter = buildFilter(startDate, endDate, location);

    let wasteLogs = [];
    let compostLogs = [];

    // Logic for distinct data fetching
    if (type === "waste") {
      wasteLogs = await Waste.find(filter).sort({ date: -1 });
    } else if (type === "composte") {
      compostLogs = await Composte.find(filter).sort({ date: -1 });
    } else {
      // Fetch both for "all"
      [wasteLogs, compostLogs] = await Promise.all([
        Waste.find(filter).sort({ date: -1 }),
        Composte.find(filter).sort({ date: -1 }),
      ]);
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader(
      "Content-disposition",
      `attachment; filename="Waste_Report_${Date.now()}.pdf"`,
    );
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    // --- PDF HEADER ---
    doc
      .fillColor("#065f46")
      .fontSize(24)
      .text("Waste Analytics Summary", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    if (startDate && endDate) {
      doc.text(`Reporting Period: ${startDate} to ${endDate}`, {
        align: "center",
      });
    }
    doc.moveDown(2);

    if (location && location !== "all") {
      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text(`Location Filter: ${location}`, { align: "center" });
      doc.moveDown(1);
    }

    if (wasteLogs.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#065f46")
        .text("Waste Logs", { align: "center" });
      doc.moveDown(1);

      wasteLogs.forEach((item, i) => {
        const dateStr = item.date
          ? item.date.toISOString().split("T")[0]
          : "N/A";
        doc
          .fontSize(10)
          .fillColor("#1f2937")
          .text(`${i + 1}. [${dateStr}] - Location: ${item.location}`);

        const w = item.weights || {};

        const food = w.food || 0;
        const paper = w.papper || 0;
        const medical = w.medicalWaste || 0;
        const poly = w.polyethene || 0;
        const ewaste = w.eWaste || 0;

        doc
          .fontSize(9)
          .fillColor("#4b5563")
          .text(
            `   Weights: Food: ${food}kg | Paper: ${paper}kg | Medical: ${medical}kg | Poly: ${poly}kg | E-Waste: ${ewaste}kg`,
          );
        doc.moveDown(0.5);
      });
      doc.moveDown(1.5);
    }

    if (compostLogs.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#065f46")
        .text("Compost Logs", { align: "center" });
      doc.moveDown(1);
      compostLogs.forEach((item, i) => {
        const dateStr = item.date
          ? item.date.toISOString().split("T")[0]
          : "N/A";
        doc
          .fontSize(10)
          .fillColor("#1f2937")
          .text(`${i + 1}. [${dateStr}] - Location: ${item.location}`);

        const wasteType = item.wasteType || "General";
        const weight = item.weight || 0;

        doc
          .fontSize(9)
          .fillColor("#4b5563")
          .text(`   Entry Type: ${wasteType} | Recorded Weight: ${weight}kg`);
        doc.moveDown(0.5);
      });
    }

    if (wasteLogs.length === 0 && compostLogs.length === 0) {
      doc
        .fontSize(12)
        .fillColor("#ef4444")
        .text("No data found for the selected dates.", { align: "center" });
    }

    doc.end();
  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).send("PDF Generation Failed");
  }
};
