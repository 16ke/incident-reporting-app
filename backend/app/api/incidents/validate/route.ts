/**
 * API Route: Validate Incident
 * POST /api/incidents/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateIncident } from '@ohoh-incident-reporter/shared';
import type { IncidentReport } from '@ohoh-incident-reporter/shared';

export async function POST(request: NextRequest) {
  try {
    const incident: IncidentReport = await request.json();

    const result = validateIncident(incident);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
