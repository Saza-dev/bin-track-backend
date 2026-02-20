import Waste from "../models/Waste.js";
import Composte from "../models/Composte.js";
import CompostProcess from "../models/ComposteProcess.js";
import CompostSale from "../models/ComposteSale.js";
import PDFDocument from "pdfkit";

export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate, type, location } = req.query;

    // 1. Build Date Filter (Robust Range)
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }

    // 2. Build Model-Specific Filters
    const filterWithLocation = {};
    if (Object.keys(dateQuery).length > 0) filterWithLocation.date = dateQuery;
    if (location && location !== "all") filterWithLocation.location = location;

    // Processing & Sales models don't have 'location', so we only filter them by date
    const filterByDateOnly = {};
    if (Object.keys(dateQuery).length > 0) filterByDateOnly.date = dateQuery;

    const totals = {
      food: 0,
      garden: 0,
      paper: 0,
      polyethene: 0,
      eWaste: 0,
      medical: 0,
      harvestedCompost: 0,
      totalIncome: 0,
    };

    const queries = [];

    // General Waste Collection
    if (type === "all" || type === "waste") {
      queries.push(
        Waste.find(filterWithLocation).then((logs) => {
          logs.forEach((entry) => {
            const w = entry.weights || {};
            totals.food += w.food?.weight || 0;
            totals.paper += w.papper?.weight || 0; // Using schema typo 'papper'
            totals.polyethene += w.polyethene?.weight || 0;
            totals.eWaste += w.eWaste?.weight || 0;
            totals.medical += w.medicalWaste?.weight || 0;
          });
        }),
      );
    }

    // Compost Collection
    if (type === "all" || type === "composte") {
      queries.push(
        Composte.find(filterWithLocation).then((logs) => {
          logs.forEach((entry) => {
            const cat = (entry.wasteType || "").toLowerCase();
            const weight = entry.weight || 0;
            if (cat.includes("food")) totals.food += weight;
            else if (cat.includes("garden")) totals.garden += weight;
          });
        }),
      );
    }

    // Processing (Note: uses 'startDate' instead of 'date')
    if (type === "all" || type === "composte") {
      const procDateFilter = {};
      if (startDate) procDateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        procDateFilter.$lte = end;
      }

      queries.push(
        CompostProcess.find({ startDate: procDateFilter }).then((procs) => {
          procs.forEach((p) => (totals.harvestedCompost += p.finalWeight || 0));
        }),
      );
    }

    // Sales (Note: CompostSale doesn't have location in the provided schema)
    if (type === "all" || type === "sales") {
      queries.push(
        CompostSale.find(filterByDateOnly).then((sales) => {
          sales.forEach((s) => (totals.totalIncome += s.actualIncome || 0));
        }),
      );
    }

    await Promise.all(queries);
    res.json({ success: true, totals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

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
  if (location && location !== "all") {
    filter.location = location;
  }
  return filter;
};

export const downloadReport = async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    const filter = buildFilter(startDate, endDate, location);

    // 1. Fetch data safely with .lean()
    const [waste, compost, sales] = await Promise.all([
      Waste.find(filter).sort({ date: -1 }).lean(),
      Composte.find(filter).sort({ date: -1 }).lean(),
      CompostSale.find(filter).sort({ date: -1 }).lean(),
    ]);

    // 2. Setup PDF Stream
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${Date.now()}.pdf"`,
      );
      res.status(200).send(pdfData);
    });

    // --- PDF CONTENT GENERATION ---
    // Header
    doc.rect(0, 0, 612, 60).fill("#10b981");
    doc.fillColor("#ffffff").fontSize(18).text("Environmental Report", 40, 22);
    doc.moveDown(3);

    // Section: General Waste
    if (waste.length > 0) {
      doc
        .fillColor("#10b981")
        .fontSize(12)
        .text("1. GENERAL WASTE COLLECTION")
        .moveDown(0.5);
      waste.forEach((item) => {
        const dateStr = item.date
          ? new Date(item.date).toLocaleDateString()
          : "N/A";
        const w = item.weights || {};

        doc
          .fillColor("#1e293b")
          .fontSize(9)
          .text(
            `[${dateStr}] ${item.location} | Collector: ${item.collectorName || "N/A"}`,
          );
        // Note: Using 'papper' to match your schema typo
        doc
          .fillColor("#64748b")
          .text(
            `   Food: ${w.food?.weight || 0}kg | Paper: ${w.papper?.weight || 0}kg | Poly: ${w.polyethene?.weight || 0}kg`,
          )
          .moveDown(0.4);
      });
      doc.moveDown();
    }

    // Section: Organic Compost
    if (compost.length > 0) {
      doc
        .fillColor("#059669")
        .fontSize(12)
        .text("2. ORGANIC COMPOST COLLECTION")
        .moveDown(0.5);
      compost.forEach((c) => {
        const dateStr = c.date ? new Date(c.date).toLocaleDateString() : "N/A";
        doc
          .fillColor("#1e293b")
          .fontSize(9)
          .text(
            `[${dateStr}] ${c.location} | ${c.wasteType} | Coll by: ${c.collectingPerson || "N/A"}`,
          );
        doc
          .fillColor("#64748b")
          .text(`   Weight: ${c.weight || 0}kg`)
          .moveDown(0.4);
      });
      doc.moveDown();
    }

    // Section: Sales & Revenue
    if (sales.length > 0) {
      doc
        .fillColor("#2563eb")
        .fontSize(12)
        .text("3. COMPOST SALES & REVENUE")
        .moveDown(0.5);
      sales.forEach((s) => {
        const dateStr = s.date ? new Date(s.date).toLocaleDateString() : "N/A";
        doc
          .fillColor("#1e293b")
          .fontSize(9)
          .text(
            `[${dateStr}] Released by: ${s.releasedPerson || "N/A"} | Vehicle: ${s.vehicleNumber}`,
          );
        doc
          .fillColor("#2563eb")
          .text(
            `   Income: LKR ${s.actualIncome?.toLocaleString() || 0} (Weight: ${s.weight || 0}kg)`,
          )
          .moveDown(0.4);
      });
    }

    doc.end();
  } catch (error) {
    console.error("PDF Export Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Internal Server Error during PDF generation",
      });
    }
  }
};
