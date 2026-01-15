/**
 * PDF Export - Main Entry Point
 * 
 * Orchestrates PDF generation and export
 */

import type {
  IncidentReport,
  PdfExportOptions,
  ValidationResult,
} from '@ohoh-incident-reporter/shared';
import { validateIncidentForPDF } from '@ohoh-incident-reporter/shared';
import { mapIncidentToPdfModel, buildPdfDocument } from './pdf-builder';
import fs from 'fs';
import path from 'path';

/**
 * PDF export result
 */
export interface PdfExportResult {
  success: boolean;
  filePath?: string;
  buffer?: Buffer;
  error?: string;
  validation?: ValidationResult;
}

/**
 * Main PDF export function
 * 
 * @param incident - The incident report to export
 * @param options - Export options
 * @param outputPath - Optional file path to save PDF
 * @returns PDF export result with file path or buffer
 */
export async function exportIncidentToPDF(
  incident: IncidentReport,
  options: PdfExportOptions,
  outputPath?: string
): Promise<PdfExportResult> {
  try {
    // Step 1: Validate incident data
    const validation = validateIncidentForPDF(incident, options);
    
    if (!validation.valid) {
      return {
        success: false,
        error: 'Incident data validation failed',
        validation,
      };
    }

    // Step 2: Map incident to PDF model
    const pdfModel = mapIncidentToPdfModel(incident, options);

    // Step 3: Build PDF document
    const doc = await buildPdfDocument(pdfModel, options);

    // Step 4: Generate PDF
    if (outputPath) {
      // Save to file
      return await savePdfToFile(doc, outputPath);
    } else {
      // Return as buffer
      return await getPdfBuffer(doc);
    }
  } catch (error: unknown) {
    console.error('PDF export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Save PDF to file
 */
async function savePdfToFile(doc: PDFKit.PDFDocument, filePath: string): Promise<PdfExportResult> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      doc.end();

      stream.on('finish', () => {
        resolve({
          success: true,
          filePath,
        });
      });

      stream.on('error', (error: Error) => {
        reject({
          success: false,
          error: error.message,
        });
      });
    } catch (error: unknown) {
      reject({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save PDF',
      });
    }
  });
}

/**
 * Get PDF as buffer
 */
async function getPdfBuffer(doc: PDFKit.PDFDocument): Promise<PdfExportResult> {
  return new Promise((resolve, reject) => {
    try {
      const buffers: Buffer[] = [];
      
      doc.on('data', (buffer: Buffer) => {
        buffers.push(buffer);
      });

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve({
          success: true,
          buffer: pdfBuffer,
        });
      });

      doc.on('error', (error: Error) => {
        reject({
          success: false,
          error: error.message,
        });
      });

      doc.end();
    } catch (error: unknown) {
      reject({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF buffer',
      });
    }
  });
}

/**
 * Generate default file name for PDF
 */
export function generatePdfFileName(incident: IncidentReport, summaryOnly: boolean): string {
  const type = summaryOnly ? 'Summary' : 'Investigation';
  const date = new Date(incident.dateOfIncident).toISOString().split('T')[0];
  const ref = incident.referenceCode.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${type}_${ref}_${date}.pdf`;
}

/**
 * Get default PDF export options
 */
export function getDefaultPdfOptions(summaryOnly: boolean = false): PdfExportOptions {
  return {
    summaryOnly,
    includePhotos: !summaryOnly,
    includeSignatures: true,
    includeRootCause: !summaryOnly,
    includeCorrectiveActions: !summaryOnly,
    includeWitnessStatements: !summaryOnly,
    includeAttachments: !summaryOnly,
    confidential: true,
  };
}
