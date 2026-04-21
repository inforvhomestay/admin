const Income = require('../models/Income');
const Guest = require('../models/Guest');
const PDFDocument = require('pdfkit');

// Helper for dates in descriptions
const formatDate = (date) => {
    try {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
    } catch (e) {
        return 'N/A';
    }
};

// @desc    Get monthly summary
// @route   GET /api/v1/reports/summary
// @access  Private
exports.getMonthlySummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Please provide month and year' });
        }

        const m = parseInt(month);
        const y = parseInt(year);

        // 1. Get Manual Income Records
        const manualIncome = await Income.find({ month: m, year: y }).populate('guest room');

        // 2. Get Paid Guest Records (Stay Revenue)
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        const guestRevenue = await Guest.find({
            paymentStatus: 'paid',
            checkIn: { $gte: startDate, $lte: endDate }
        }).populate('rooms.room currentRoom');

        console.log(`Found ${manualIncome.length} manual records and ${guestRevenue.length} guests for ${m}/${y}`);

        // Normalize Guests to transaction-like objects
        const guestTransactions = guestRevenue.map(g => ({
            _id: g._id,
            date: g.checkIn,
            guest: { name: g.name },
            room: { name: g.rooms && g.rooms.length > 0 ? (g.rooms[0].room?.name || 'Multiple') : (g.currentRoom?.name || 'N/A') },
            amount: g.totalAmount || 0,
            description: `Stay: ${g.name} (${formatDate(g.checkIn)} - ${g.checkOut ? formatDate(g.checkOut) : '??'})`,
            source: 'stay'
        }));

        // Merge and summarize
        const allTransactions = [
            ...manualIncome.map(t => ({
                _id: t._id,
                date: t.date,
                guest: t.guest,
                room: t.room,
                amount: t.amount,
                description: t.description,
                source: 'manual'
            })),
            ...guestTransactions
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        const totalIncome = allTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalIncome,
                    count: allTransactions.length
                },
                transactions: allTransactions
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

        const m = parseInt(month);
        const y = parseInt(year);

        // Fetch and Merge logic (Same as summary)
        const manualIncome = await Income.find({ month: m, year: y }).populate('guest room');
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);
        const guestRevenue = await Guest.find({
            paymentStatus: 'paid',
            checkIn: { $gte: startDate, $lte: endDate }
        }).populate('rooms.room currentRoom');

        const transactions = [
            ...manualIncome.map(t => ({
                date: t.date,
                guestName: t.guest?.name || 'N/A',
                roomName: t.room?.name || 'N/A',
                amount: t.amount,
                description: t.description || 'Manual Entry'
            })),
            ...guestRevenue.map(g => ({
                date: g.checkIn,
                guestName: g.name,
                roomName: g.rooms && g.rooms.length > 0 ? (g.rooms[0].room?.name || 'Multiple') : (g.currentRoom?.name || 'N/A'),
                amount: g.totalAmount || 0,
                description: `Stay Reservation Record`
            }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

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

        let y_pos = 230;
        transactions.forEach((t) => {
            doc.text(new Date(t.date).toLocaleDateString(), 50, y_pos);
            doc.text(t.guestName, 120, y_pos);
            doc.text(t.roomName, 250, y_pos);
            doc.text(t.description, 350, y_pos, { width: 140 });
            doc.text(`LKR ${t.amount.toLocaleString()}`, 500, y_pos);
            y_pos += 20;
            if (y_pos > 700) {
                doc.addPage();
                y_pos = 50;
            }
        });

        doc.end();
        doc.pipe(res);

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
