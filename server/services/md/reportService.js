import * as reportModel from '../../models/md/reportModel.js';
import { generatePDF } from '../../utils/pdfGenerator.js';
import { formatFileSize } from '../../utils/formatUtils.js';
import fs from 'fs';
import path from 'path';

export const autoSaveReport = async (empId, reportType, filters = {}, savePath) => {
    try {
        // Generate report data
        const reportData = await getReportData(reportType, filters);
        const pdfContent = getPdfContent(reportType, reportData, filters);
        const pdfBuffer = await generatePDF(pdfContent);

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${reportType}_${timestamp}.pdf`;
        const fullPath = path.join(savePath, filename);

        // Ensure directory exists
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        // Save to file system
        fs.writeFileSync(fullPath, pdfBuffer);

        // Log in database (optional)
        await ReportModel.logReportAction({
            report_id: `local-${Date.now()}`,
            action: 'auto_save',
            status: 'success',
            user_id: empId,
            message: `Report auto-saved to ${fullPath}`,
            details: { path: fullPath }
        });

        return { success: true, path: fullPath };
    } catch (error) {
        await ReportModel.logReportAction({
            report_id: `local-${Date.now()}`,
            action: 'auto_save',
            status: 'failed',
            user_id: empId,
            message: 'Auto-save failed',
            details: { error: error.message }
        });
        throw error;
    }
};

export const generateReport = async (empId, reportType, filters = {}) => {
    const startTime = Date.now();
    const period = `Q${Math.floor((new Date().getMonth() + 3) / 3)} ${new Date().getFullYear()}`;

    try {
        // Validate inputs
        if (!empId || !reportType) {
            throw new Error('Employee ID and report type are required');
        }

        // Get report data and generate PDF
        const reportData = await reportModel.getReportData(reportType, filters);
        const pdfContent = getPdfContent(reportType, reportData, filters);
        const pdfData = await generatePDF(pdfContent);
        const fileSize = formatFileSize(Buffer.byteLength(pdfData));

        // FIRST: Create the report record and get its actual database ID
        const report = await reportModel.createReport({
            name: `${reportType} Report`,
            type: reportType,
            created_by: empId,
            download_url: `/reports/${Date.now()}.pdf`,
            config: {
                period,
                filters,
                generatedAt: new Date().toISOString(),
                recordCount: reportData.length
            }
        });

        // SECOND: Now log the action with the valid report_id
        await reportModel.logReportAction({
            report_id: report.id, // Use the actual report ID from the database
            action: 'generate',
            status: 'success',
            user_id: empId,
            message: `${reportType} report generated successfully`,
            details: {
                filters,
                executionTime: `${Date.now() - startTime}ms`,
                fileSize
            }
        });

        return {
            reportId: report.id,
            downloadUrl: `/reports/${report.id}.pdf`,
            fileSize,
            recordCount: reportData.length
        };
    } catch (error) {
        // Log failure (without report_id if creation failed)
        await reportModel.logReportAction({
            report_id: null, // Allow NULL if report creation failed
            action: 'generate',
            status: 'failed',
            user_id: empId,
            message: `Failed to generate ${reportType} report`,
            details: {
                error: error.message,
                filters
            }
        });
        throw error;
    }
};

const getPdfContent = (reportType, data = [], filters = {}) => {
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];

    const commonHeader = {
        text: `${reportType.replace(/([A-Z])/g, ' $1')} Report`,
        style: 'header',
        margin: [0, 0, 0, 10]
    };

    const filterText = {
        text: `Filters: ${Object.entries(filters)
            .map(([key, val]) => `${key}: ${val}`)
            .join(' | ') || 'None'}`,
        margin: [0, 0, 0, 10]
    };

    const content = {
        title: `${reportType.replace(/([A-Z])/g, ' $1')} Report`,
        content: [commonHeader, filterText]
    };

    // Add table only if we have data
    if (safeData.length > 0) {
        let tableConfig = {
            table: {
                headerRows: 1,
                widths: ['*'],
                body: []
            }
        };

        switch(reportType) {
            case 'otReport':
                tableConfig.table.widths = ['*', '*', '*', '*'];
                tableConfig.table.body = [
                    ['Employee', 'ID', 'Total Hours', 'Total Amount'],
                    ...safeData.map(row => [
                        `${row.first_name || ''} ${row.last_name || ''}`.trim(),
                        row.empId || '',
                        row.totalHours || '0',
                        `$${(row.totalAmount || 0).toFixed(2)}`
                    ])
                ];
                break;

            case 'kpiReport':
                tableConfig.table.widths = ['*', '*', '*', '*', '*'];
                tableConfig.table.body = [
                    ['Employee', 'ID', 'Department', 'KPI Score', 'Rank'],
                    ...safeData.map(row => [
                        `${row.first_name || ''} ${row.last_name || ''}`.trim(),
                        row.empId || '',
                        row.departmentName || '',
                        row.kpiValue || '',
                        row.kpiRank || ''
                    ])
                ];
                break;

            default:
                content.content.push({
                    text: 'Report data not available in specified format',
                    margin: [0, 20, 0, 0]
                });
                return content;
        }

        content.content.push(tableConfig);
    } else {
        content.content.push({
            text: 'No data available for this report',
            margin: [0, 20, 0, 0]
        });
    }

    return content;
};