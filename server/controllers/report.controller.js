const Income = require('../models/Income');
const PDFDocument = require('pdfkit');

// @desc    Get monthly summary
// @route   GET /api/v1/reports/summary
// @access  Private
exports.getMonthlySummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Please provide month and year' });
        }

        const stats = await Income.aggregate([
            {
                $match: {
                    month: parseInt(month),
                    year: parseInt(year)
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const transactions = await Income.find({
            month: parseInt(month),
            year: parseInt(year)
        }).populate('guest room');

        res.status(200).json({
            success: true,
            data: {
                summary: stats[0] || { totalIncome: 0, count: 0 },
                transactions
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Download monthly PDF report
// @route   GET /api/v1/reports/download-pdf
// @access  Private
exports.downloadMonthlyPDF = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Please provide month and year' });
        }

        const transactions = await Income.find({
            month: parseInt(month),
            year: parseInt(year)
        }).populate('guest room');

        const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        const doc = new PDFDocument();
        const filename = `Report-${month}-${year}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.fontSize(20).text(`Inforv Homestay Monthly Summary`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Period: ${month}/${year}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Total Income: LKR ${total.toLocaleString()}`, { underline: true });
        doc.moveDown();

        // Table Header
        doc.fontSize(10).text('Date', 50, 200);
        doc.text('Guest Name', 120, 200);
        doc.text('Room', 250, 200);
        doc.text('Description', 350, 200);
        doc.text('Amount', 500, 200);

        doc.moveTo(50, 215).lineTo(550, 215).stroke();

        let y = 230;
        transactions.forEach((t) => {
            doc.text(new Date(t.date).toLocaleDateString(), 50, y);
            doc.text(t.guest?.name || 'N/A', 120, y);
            doc.text(t.room?.name || 'N/A', 250, y);
            doc.text(t.description || '', 350, y, { width: 140 });
            doc.text(`LKR ${t.amount.toLocaleString()}`, 500, y);
            y += 20;
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
        });

        doc.end();
        doc.pipe(res);

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
