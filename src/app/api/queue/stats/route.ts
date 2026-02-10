/**
 * GET /api/queue/stats - Learning dashboard statistics
 */

import { NextResponse } from 'next/server';
import { getDb, queryAll, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    // KPIs
    const kpis = queryOne<{
      total_reviewed: number;
      approval_rate: number;
      auto_approve_rate: number;
      avg_confidence: number;
    }>(`
      SELECT
        COUNT(*) as total_reviewed,
        AVG(CASE WHEN status IN ('approved', 'auto_approved', 'edited') THEN 1.0 ELSE 0.0 END) as approval_rate,
        AVG(CASE WHEN status = 'auto_approved' THEN 1.0 ELSE 0.0 END) as auto_approve_rate,
        AVG(confidence) as avg_confidence
      FROM action_queue
      WHERE reviewed_at IS NOT NULL
    `);

    // Approval trends (last 30 days)
    const approvalTrends = queryAll<{
      date: string;
      approved: number;
      denied: number;
      edited: number;
      auto_approved: number;
    }>(`
      SELECT
        DATE(reviewed_at) as date,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'denied' THEN 1 ELSE 0 END) as denied,
        SUM(CASE WHEN status = 'edited' THEN 1 ELSE 0 END) as edited,
        SUM(CASE WHEN status = 'auto_approved' THEN 1 ELSE 0 END) as auto_approved
      FROM action_queue
      WHERE reviewed_at >= DATE('now', '-30 days')
      GROUP BY DATE(reviewed_at)
      ORDER BY date
    `);

    // Confidence trends by type (last 30 days)
    const confidenceTrendsRaw = queryAll<{
      date: string;
      action_type: string;
      avg_confidence: number;
    }>(`
      SELECT
        DATE(reviewed_at) as date,
        action_type,
        AVG(confidence) as avg_confidence
      FROM action_queue
      WHERE reviewed_at >= DATE('now', '-30 days') AND confidence IS NOT NULL
      GROUP BY DATE(reviewed_at), action_type
      ORDER BY date
    `);

    // Transform confidence trends into wide format
    const confidenceTrends: Record<string, any> = {};
    confidenceTrendsRaw.forEach((row) => {
      if (!confidenceTrends[row.date]) {
        confidenceTrends[row.date] = { date: row.date };
      }
      confidenceTrends[row.date][row.action_type] = row.avg_confidence;
    });

    // Type breakdown
    const typeBreakdown = queryAll<{
      action_type: string;
      approved: number;
      denied: number;
      edited: number;
      auto_approved: number;
    }>(`
      SELECT
        action_type,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'denied' THEN 1 ELSE 0 END) as denied,
        SUM(CASE WHEN status = 'edited' THEN 1 ELSE 0 END) as edited,
        SUM(CASE WHEN status = 'auto_approved' THEN 1 ELSE 0 END) as auto_approved
      FROM action_queue
      WHERE reviewed_at IS NOT NULL
      GROUP BY action_type
      ORDER BY (approved + denied + edited + auto_approved) DESC
    `);

    // Top denied patterns
    const topDeniedPatterns = queryAll<{
      action_type: string;
      pattern: string;
      count: number;
      example: string;
    }>(`
      SELECT
        action_type,
        user_feedback as pattern,
        COUNT(*) as count,
        action_data as example
      FROM action_queue
      WHERE status = 'denied' AND user_feedback IS NOT NULL
      GROUP BY action_type, user_feedback
      ORDER BY count DESC
      LIMIT 10
    `);

    // Rule effectiveness
    const ruleEffectiveness = queryAll<{
      rule_id: number;
      description: string;
      times_triggered: number;
      success_rate: number;
      last_triggered: string | null;
    }>(`
      SELECT
        id as rule_id,
        action_type || ' auto-approve rule' as description,
        times_triggered,
        COALESCE(success_rate, 0) as success_rate,
        NULL as last_triggered
      FROM auto_approve_rules
      ORDER BY times_triggered DESC
    `);

    return NextResponse.json({
      kpis: {
        total_reviewed: kpis?.total_reviewed || 0,
        approval_rate: kpis?.approval_rate || 0,
        auto_approve_rate: kpis?.auto_approve_rate || 0,
        avg_confidence: kpis?.avg_confidence || 0,
      },
      approval_trends: approvalTrends,
      confidence_trends: Object.values(confidenceTrends),
      type_breakdown: typeBreakdown,
      top_denied_patterns: topDeniedPatterns.map((p) => ({
        ...p,
        example: p.example ? JSON.parse(p.example) : null,
      })),
      rule_effectiveness: ruleEffectiveness,
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
