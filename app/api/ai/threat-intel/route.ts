
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

    const { query, context } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert threat intelligence analyst specializing in the SOaC (Security Operations as Code) Framework. You provide actionable intelligence on emerging threats, attack patterns, and defensive strategies.

Your analysis should include:
1. **Threat Overview**: Nature and scope of the threat
2. **Attack Patterns**: TTPs (Tactics, Techniques, Procedures) used by threat actors
3. **MITRE ATT&CK Mapping**: Relevant tactics and techniques
4. **Indicators of Compromise (IOCs)**: IPs, domains, file hashes, behaviors
5. **Detection Strategies**: How to identify this threat in your environment
6. **Prevention Measures**: Proactive defenses to implement
7. **Correlation Patterns**: Multi-source detection logic for the SOaC Framework
8. **SOAR Playbooks**: Automated response recommendations
9. **Threat Actor Context**: Known groups, motivations, targeting
10. **Industry Impact**: Sectors and geographies most affected

Please respond in JSON format with the following structure:
{
  "threat_intelligence": {
    "threat_name": "Name of threat",
    "threat_type": "Malware/APT/Vulnerability/Campaign/Technique",
    "severity": "Critical/High/Medium/Low",
    "first_seen": "Date or 'Unknown'",
    "last_updated": "Date or 'Current'",
    "executive_summary": "High-level overview for leadership",
    "technical_summary": "Detailed analysis for SOC teams",
    "mitre_attack": {
      "tactics": ["Tactic1", "Tactic2"],
      "techniques": [
        {
          "id": "T1234.001",
          "name": "Technique name",
          "description": "How it's used in this threat"
        }
      ]
    },
    "iocs": {
      "ip_addresses": ["1.2.3.4"],
      "domains": ["malicious.com"],
      "file_hashes": {
        "md5": ["hash1"],
        "sha256": ["hash2"]
      },
      "urls": ["https://bad.site/malware"],
      "email_indicators": ["phishing@evil.com"],
      "behavioral_indicators": ["Unusual PowerShell activity", "Beaconing to C2"]
    },
    "detection_rules": [
      {
        "platform": "SIEM/Falcon/PAN-OS/EntraID",
        "rule_name": "Detection rule name",
        "logic": "Detection logic or query",
        "confidence": "High/Medium/Low"
      }
    ],
    "prevention_measures": [
      {
        "action": "Preventive action",
        "priority": "Immediate/High/Medium/Low",
        "implementation": "How to implement",
        "effectiveness": "Expected impact"
      }
    ],
    "correlation_pattern": {
      "pattern_name": "SOaC correlation pattern name",
      "sources": ["Falcon", "EntraID", "PAN-OS"],
      "phases": ["Initial Access", "Execution", "Exfiltration"],
      "correlation_logic": "Multi-source join logic",
      "time_window": "Correlation window"
    },
    "soar_playbook": {
      "containment": ["Action1", "Action2"],
      "eradication": ["Action3", "Action4"],
      "recovery": ["Action5", "Action6"]
    },
    "threat_actors": [
      {
        "name": "Threat actor or group",
        "motivation": "Financial/Espionage/Destruction",
        "targeting": "Industries or geographies targeted",
        "sophistication": "Advanced/Intermediate/Low"
      }
    ],
    "industry_impact": {
      "affected_sectors": ["Finance", "Healthcare"],
      "geographic_focus": ["North America", "Europe"],
      "estimated_damages": "Financial or operational impact"
    },
    "references": ["URL1", "URL2"],
    "recommendations": ["Recommendation1", "Recommendation2"]
  }
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    const userMessage = context 
      ? `${query}\n\nAdditional Context:\n${context}`
      : query;

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
          { role: 'user', content: userMessage }
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
                    message: 'Analyzing threat intelligence...'
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
    console.error('Error in threat intel:', error);
    return NextResponse.json(
      { error: 'Failed to analyze threat intelligence' },
      { status: 500 }
    );
  }
}
