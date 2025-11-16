
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const framework = formData.get('framework') as string;

    if (!file || !framework) {
      return NextResponse.json(
        { error: 'Missing file or framework' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const fileName = file.name;

    const frameworkDetails = {
      'nist': 'NIST Cybersecurity Framework 2.0 with specific control families',
      'iso27001': 'ISO/IEC 27001:2022 with Annex A controls',
      'cis': 'CIS Controls v8 with implementation groups',
      'soc2': 'SOC 2 Trust Services Criteria (Security, Availability, Confidentiality, Processing Integrity, Privacy)',
      'pci-dss': 'PCI DSS 4.0 requirements for payment card security',
      'hipaa': 'HIPAA Security Rule requirements for healthcare data'
    };

    const systemPrompt = `You are an expert compliance auditor specializing in cybersecurity frameworks and the SOaC (Security Operations as Code) Framework. You validate security configurations against compliance standards.

Framework: ${framework} (${frameworkDetails[framework as keyof typeof frameworkDetails] || framework})
File: ${fileName}

Your compliance check should provide:
1. **Compliance Score**: Overall percentage of requirements met (0-100%)
2. **Control Mapping**: Which controls are satisfied by current configuration
3. **Gaps**: Missing or partially implemented controls
4. **Risk Assessment**: Business and regulatory risk of non-compliance
5. **Remediation Plan**: Prioritized actions to achieve compliance
6. **Evidence**: Specific configuration items that satisfy controls
7. **Audit Trail**: Documentation for compliance reporting

Please respond in JSON format with the following structure:
{
  "compliance_check": {
    "framework": "${framework}",
    "overall_score": 75,
    "grade": "B",
    "status": "Partially Compliant",
    "summary": "Executive summary of compliance status",
    "controls": [
      {
        "control_id": "Control identifier",
        "control_name": "Control name",
        "status": "Compliant/Partial/Non-Compliant/Not Applicable",
        "evidence": "Configuration items that satisfy this control",
        "gaps": "What's missing",
        "risk_level": "Critical/High/Medium/Low",
        "remediation": "How to achieve compliance"
      }
    ],
    "compliant_controls": ["Control1", "Control2"],
    "partial_controls": ["Control3"],
    "non_compliant_controls": ["Control4", "Control5"],
    "critical_gaps": [
      {
        "gap": "Description of critical gap",
        "control": "Affected control",
        "business_impact": "Impact of non-compliance",
        "regulatory_risk": "Fines, penalties, or legal exposure",
        "priority": "Immediate/High/Medium/Low",
        "effort": "Level of effort to remediate",
        "recommendation": "Specific action items"
      }
    ],
    "remediation_roadmap": [
      {
        "phase": "Phase 1/2/3",
        "timeline": "Estimated timeline",
        "actions": ["Action1", "Action2"],
        "controls_addressed": ["Control1", "Control2"],
        "expected_score_improvement": "+15%"
      }
    ],
    "audit_report": "Detailed compliance report for auditors",
    "next_steps": ["Step1", "Step2", "Step3"]
  }
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

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
          { role: 'user', content: `Please perform a compliance check against ${framework} for the following configuration:\n\n${fileContent}` }
        ],
        stream: true,
        max_tokens: 8000,
        response_format: { type: "json_object" }
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
        
        let buffer = '';
        let partialRead = '';
        
        try {
          while (true) {
            const { done, value } = await reader?.read() || { done: true, value: undefined };
            if (done) break;
            
            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split('\n');
            partialRead = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer);
                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: finalResult
                    });
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                  } catch (e) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Failed to parse response' })}\n\n`));
                  }
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  buffer += parsed.choices?.[0]?.delta?.content || '';
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Checking compliance...'
                  });
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Stream processing failed' })}\n\n`));
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
    console.error('Error in compliance checker:', error);
    return NextResponse.json(
      { error: 'Failed to check compliance' },
      { status: 500 }
    );
  }
}
