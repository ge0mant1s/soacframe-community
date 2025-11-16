
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
    const analysisType = formData.get('analysisType') as string;

    if (!file || !analysisType) {
      return NextResponse.json(
        { error: 'Missing file or analysis type' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const fileName = file.name;
    const fileType = file.type;

    const systemPrompt = `You are an expert security policy analyst specializing in the SOaC (Security Operations as Code) Framework. You analyze security policies, detection rules, and firewall configurations to identify gaps, suggest optimizations, and improve security posture.

Analysis Type: ${analysisType}
File Name: ${fileName}
File Type: ${fileType}

Your analysis should include:
1. **Executive Summary**: High-level overview of findings
2. **Security Gaps**: Critical vulnerabilities or missing protections
3. **Optimization Opportunities**: Performance and accuracy improvements
4. **MITRE ATT&CK Coverage**: Tactics and techniques addressed (and gaps)
5. **Compliance Alignment**: Mapping to security frameworks (NIST, ISO 27001, CIS)
6. **False Positive Risk**: Areas likely to generate noise
7. **Tuning Recommendations**: Specific improvements with priority levels
8. **Quick Wins**: Immediate actions for maximum impact
9. **Risk Score**: Overall security posture rating (1-10)

Please respond in JSON format with the following structure:
{
  "analysis": {
    "executive_summary": "Brief overview",
    "risk_score": 7,
    "security_gaps": [
      {
        "title": "Gap title",
        "severity": "Critical/High/Medium/Low",
        "description": "Detailed description",
        "impact": "Business impact",
        "recommendation": "How to fix"
      }
    ],
    "optimizations": [
      {
        "title": "Optimization title",
        "priority": "High/Medium/Low",
        "current_state": "Current configuration",
        "proposed_state": "Improved configuration",
        "expected_benefit": "Performance/accuracy improvement"
      }
    ],
    "mitre_coverage": {
      "covered_tactics": ["Tactic1", "Tactic2"],
      "covered_techniques": ["T1234.001"],
      "missing_tactics": ["Tactic3"],
      "missing_techniques": ["T5678.002"]
    },
    "compliance": {
      "nist": {
        "covered": ["Control1", "Control2"],
        "missing": ["Control3"]
      },
      "iso27001": {
        "covered": ["Annex A.1", "Annex A.2"],
        "missing": ["Annex A.3"]
      },
      "cis": {
        "covered": ["CIS 1.1", "CIS 2.1"],
        "missing": ["CIS 3.1"]
      }
    },
    "false_positive_risk": {
      "overall_risk": "High/Medium/Low",
      "high_risk_rules": [
        {
          "rule_name": "Rule name",
          "reason": "Why it generates FPs",
          "mitigation": "How to reduce FPs"
        }
      ]
    },
    "quick_wins": [
      {
        "action": "Quick action",
        "effort": "Low/Medium/High",
        "impact": "Expected improvement"
      }
    ],
    "detailed_findings": "Comprehensive analysis with technical details"
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
          { role: 'user', content: `Please analyze the following security policy/rules:\n\n${fileContent}` }
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
                    message: 'Analyzing policy...'
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
    console.error('Error in policy analyzer:', error);
    return NextResponse.json(
      { error: 'Failed to analyze policy' },
      { status: 500 }
    );
  }
}
