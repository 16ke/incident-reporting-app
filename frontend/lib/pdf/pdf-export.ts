/**
 * React Native PDF Generator
 * 
 * Client-side PDF generation for mobile app
 * Uses HTML-to-PDF approach for React Native
 */

import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type {
  IncidentReport,
  PdfExportOptions,
  ValidationResult,
} from '@/shared';
import { validateIncidentForPDF } from '@/shared';
import { generatePdfHtml } from './pdf-html-template';

/**
 * PDF export result for React Native
 */
export interface RNPdfExportResult {
  success: boolean;
  uri?: string;
  error?: string;
  validation?: ValidationResult;
}

/**
 * Export incident to PDF on React Native
 * 
 * Strategy: Generate HTML and convert to PDF using backend API
 * For offline: Store HTML and allow user to export later
 */
export async function exportIncidentToPDF(
  incident: IncidentReport,
  options: PdfExportOptions,
  backendUrl?: string
): Promise<RNPdfExportResult> {
  try {
    // Step 1: Validate incident data
    const validation = validateIncidentForPDF(incident, options);
    
    if (!validation.valid) {
      return {
        success: false,
        error: 'Incident data validation failed. Please check all required fields.',
        validation,
      };
    }

    // Step 2: Generate HTML template
    const html = generatePdfHtml(incident, options);

    // Step 3: Convert to PDF
    if (backendUrl) {
      // Use backend API to generate PDF
      return await generatePdfViaApi(html, incident, options, backendUrl);
    } else {
      // Save HTML locally for later conversion
      return await saveHtmlLocally(html, incident, options);
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
 * Generate PDF via backend API
 */
async function generatePdfViaApi(
  html: string,
  incident: IncidentReport,
  options: PdfExportOptions,
  backendUrl: string
): Promise<RNPdfExportResult> {
  try {
    const response = await fetch(`${backendUrl}/api/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        incident,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Save blob to file system
    const fileName = generatePdfFileName(incident, options.summaryOnly);
    const file = new File(Paths.document, fileName);
    
    // Write blob to file using writable stream
    const arrayBuffer = await blob.arrayBuffer();
    const writer = file.writableStream().getWriter();
    await writer.write(new Uint8Array(arrayBuffer));
    await writer.close();

    return {
      success: true,
      uri: file.uri,
    };
  } catch (error: unknown) {
    console.error('API PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF via API',
    };
  }
}

/**
 * Save HTML locally (fallback when offline)
 */
async function saveHtmlLocally(
  html: string,
  incident: IncidentReport,
  options: PdfExportOptions
): Promise<RNPdfExportResult> {
  try {
    const fileName = generatePdfFileName(incident, options.summaryOnly).replace('.pdf', '.html');
    const file = new File(Paths.document, fileName);
    
    // Write HTML string to file
    const encoder = new TextEncoder();
    const data = encoder.encode(html);
    const writer = file.writableStream().getWriter();
    await writer.write(data);
    await writer.close();

    return {
      success: true,
      uri: file.uri,
    };
  } catch (error: unknown) {
    console.error('HTML save error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save HTML',
    };
  }
}

/**
 * Share PDF file
 */
export async function sharePdf(uri: string): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Incident Report',
    });
  } catch (error: unknown) {
    console.error('Share PDF error:', error);
    throw error;
  }
}

/**
 * Generate PDF file name
 */
function generatePdfFileName(incident: IncidentReport, summaryOnly: boolean): string {
  const type = summaryOnly ? 'Summary' : 'Investigation';
  const date = new Date(incident.dateOfIncident).toISOString().split('T')[0];
  const ref = incident.referenceCode.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${type}_${ref}_${date}.pdf`;
}

/**
 * Delete PDF file
 */
export async function deletePdf(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    await file.delete();
  } catch (error: unknown) {
    console.error('Delete PDF error:', error);
    throw error;
  }
}

/**
 * List all saved PDFs
 */
export async function listSavedPdfs(): Promise<any[]> {
  try {
    const files = await Paths.document.list();
    const pdfFiles = files.filter(f => f.name.endsWith('.pdf') || f.name.endsWith('.html'));
    
    return pdfFiles.map(file => ({
      uri: file.uri,
      name: file.name,
      exists: true,
    }));
  } catch (error: unknown) {
    console.error('List PDFs error:', error);
    return [];
  }
}

