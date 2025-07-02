import jsPDF from 'jspdf';

export const generatePDF = (data) => {
    try {
        const doc = new jsPDF();

        // Validate input data
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data provided for PDF generation');
        }

        // Add content to PDF with proper error handling
        let yPosition = 20; // Starting Y position

        // Ensure text content is string and coordinates are numbers
        const addText = (text, x, y, options = {}) => {
            if (typeof text !== 'string') {
                text = String(text); // Convert to string if not already
            }
            doc.text(text, Number(x), Number(y), options);
        };

        // Add title
        addText('OT Report', 105, yPosition, { align: 'center' });
        yPosition += 10;

        // Add date range if available
        if (data.startDate && data.endDate) {
            addText(`Period: ${data.startDate} to ${data.endDate}`, 105, yPosition, { align: 'center' });
            yPosition += 15;
        }

        // Add other data fields as needed
        // Example:
        // addText(`Status: ${data.status || 'N/A'}`, 20, yPosition);
        // yPosition += 10;

        // Handle table data if present
        if (data.rows && Array.isArray(data.rows)) {
            // Implement table generation logic here
        }

        return doc.output('arraybuffer');
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF document');
    }
};