/**
 * API Route: Generate PDF
 * POST /api/pdf/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportIncidentToPDF, generatePdfFileName } from '@/lib/pdf';
import type { IncidentReport, PdfExportOptions } from '@ohoh-incident-reporter/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { incident, options }: { incident: IncidentReport; options: PdfExportOptions } = body;

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident data is required' },
        { status: 400 }
      );
    }

    // Generate PDF
    const result = await exportIncidentToPDF(incident, options);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          validation: result.validation 
        },
        { status: 400 }
      );
    }

    // Return PDF as blob
    if (result.buffer) {
      const fileName = generatePdfFileName(incident, options.summaryOnly);
      
      return new NextResponse(result.buffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error('PDF generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
