
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

    const { userInput, platform, ruleType } = await request.json();

    if (!userInput || !platform || !ruleType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert security engineer specializing in the SOaC (Security Operations as Code) Framework. You help security teams generate detection rules and security policies for various platforms.

Your task is to convert natural language security requirements into precise, production-ready security rules.

Platform: ${platform}
Rule Type: ${ruleType}

Framework Context:
- The SOaC Framework uses a unified threat-centric correlation model
- Detection rules follow MITRE ATT&CK framework mapping
- Rules must include: correlation logic, time windows, entity pivots, severity levels
- Support for multi-source telemetry correlation (Falcon, EntraID, PAN-OS, Umbrella, CloudTrail, Azure)

Guidelines:
1. Generate syntactically correct rules for the specified platform
2. Include detailed comments explaining the logic
3. Map to appropriate MITRE ATT&CK tactics and techniques
4. Define correlation windows and thresholds
5. Specify severity levels and alert policies
6. Include entity-based joins where applicable
7. Provide implementation notes and tuning guidance

Please respond in JSON format with the following structure:
{
  "rule": {
    "name": "Rule name",
    "description": "Detailed description",
    "platform": "${platform}",
    "type": "${ruleType}",
    "severity": "High/Medium/Low/Critical",
    "mitre_tactics": ["Tactic1", "Tactic2"],
    "mitre_techniques": ["T1234.001", "T5678.002"],
    "query": "The actual rule/query code",
    "correlation_window": "Time window (e.g., 30 min, 1 hour)",
    "entities": ["Entity1", "Entity2"],
    "threshold": "Triggering threshold",
    "implementation_notes": "Step-by-step implementation guidance",
    "tuning_guidance": "Recommendations for reducing false positives",
    "soar_playbook": "Recommended automated response actions"
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
          { role: 'user', content: userInput }
        ],
        stream: true,
        max_tokens: 4000,
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
                    message: 'Generating rule...'
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
    console.error('Error in rule generator:', error);
    return NextResponse.json(
      { error: 'Failed to generate rule' },
      { status: 500 }
    );
  }
}
