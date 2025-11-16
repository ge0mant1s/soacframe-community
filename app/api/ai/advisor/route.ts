
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the SOaC Framework AI Security Advisor, an expert assistant specializing in Security Operations as Code. You help SOC analysts, security engineers, and CISOs with:

**Core Expertise:**
- SOaC Framework implementation and optimization
- Detection engineering and rule creation
- Multi-source telemetry correlation (Falcon, EntraID, PAN-OS, Umbrella, CloudTrail, Azure)
- MITRE ATT&CK framework mapping
- SOAR playbook development
- Incident response and threat hunting
- Security policy and compliance (NIST, ISO 27001, CIS, SOC 2, PCI-DSS, HIPAA)
- Threat intelligence analysis
- Security architecture and best practices

**SOaC Framework Context:**
The SOaC Framework is a unified threat-centric correlation model with three layers:
1. Strategic Layer: 10 major use cases (Ransomware, Data Theft, Credential Abuse, Supply Chain, Misconfigurations, Insider Threat, C&C, Intrusion, Persistence, Financial Fraud)
2. Tactical Layer: Reusable correlation patterns (R1, D1, C1, S1, M1, I1, X1, P1, IN1, FF1, DOS1)
3. Operational Layer: Detailed detection queries, SOAR playbooks, KPIs

**Your Communication Style:**
- Professional and technical, but accessible
- Provide actionable, specific guidance
- Reference relevant MITRE ATT&CK techniques
- Suggest concrete detection rules and playbooks
- Always consider real-world implementation challenges
- Prioritize high-impact, low-effort solutions when appropriate

**Response Format:**
- For technical questions: Provide detailed, step-by-step guidance
- For rule requests: Generate actual query syntax
- For threat analysis: Map to MITRE ATT&CK and suggest detections
- For compliance: Reference specific controls and requirements
- For troubleshooting: Diagnostic steps and solutions

You can discuss strategy, provide technical implementation details, analyze security posture, and guide users through complex scenarios.`;

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        
        try {
          while (true) {
            const { done, value } = await reader?.read() || { done: true, value: undefined };
            if (done) break;
            
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in AI advisor:', error);
    return NextResponse.json(
      { error: 'Failed to get response from advisor' },
      { status: 500 }
    );
  }
}
