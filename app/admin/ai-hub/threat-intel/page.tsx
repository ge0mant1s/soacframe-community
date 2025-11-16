'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Loader2, ArrowLeft, Shield, AlertTriangle, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ThreatIntelPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const exampleQueries = [
    'Latest ransomware campaigns targeting healthcare sector',
    'Log4Shell vulnerability exploitation techniques and detection',
    'Business Email Compromise (BEC) attack patterns',
    'Lazarus Group APT tactics and indicators of compromise'
  ];

  const handleAnalyze = async () => {
    if (!query) {
      toast.error('Please enter a threat query');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/threat-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context })
      });

      if (!response.ok) throw new Error('Failed to analyze threat');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let partialRead = '';

      while (true) {
        const { done, value } = await reader?.read() || { done: true, value: undefined };
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split('\n');
        partialRead = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.status === 'completed') {
                setResult(parsed.result);
                toast.success('Analysis completed!');
                setLoading(false);
                return;
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Analysis failed');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to analyze threat');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-red-500" />
            Threat Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered threat analysis and detection strategies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Threat Query</CardTitle>
            <CardDescription>Describe the threat or attack pattern you want to analyze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Example: Analyze the latest ransomware campaigns targeting healthcare..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Additional Context (Optional)</p>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Add any specific context about your environment, industry, or concerns..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Example Queries</p>
              <div className="space-y-2">
                {exampleQueries.map((ex, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-auto py-2 px-3 text-left"
                    onClick={() => setQuery(ex)}
                  >
                    {ex}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={loading || !query}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Threat...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Threat
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Intelligence Report</CardTitle>
            <CardDescription>Actionable intelligence and detection strategies</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Enter a threat query to get AI-powered intelligence
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Analyzing threat intelligence...</p>
              </div>
            )}

            {result && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="iocs">IOCs</TabsTrigger>
                  <TabsTrigger value="detection">Detection</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">{result.threat_intelligence?.threat_name || 'Unknown Threat'}</h3>
                    <div className="flex gap-2">
                      <Badge>{result.threat_intelligence?.threat_type || 'Unknown'}</Badge>
                      <Badge variant="destructive">{result.threat_intelligence?.severity || 'Unknown'}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Executive Summary</p>
                    <p className="text-sm text-muted-foreground">
                      {result.threat_intelligence?.executive_summary || 'No summary available'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">MITRE ATT&CK Tactics</p>
                    <div className="flex flex-wrap gap-2">
                      {result.threat_intelligence?.mitre_attack?.tactics?.map((tactic: string, idx: number) => (
                        <Badge key={idx} variant="outline">{tactic}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="iocs" className="space-y-4 mt-4">
                  {result.threat_intelligence?.iocs?.ip_addresses?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">IP Addresses</p>
                      <div className="flex flex-wrap gap-2">
                        {result.threat_intelligence.iocs.ip_addresses.map((ip: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="font-mono text-xs">{ip}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.threat_intelligence?.iocs?.domains?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Domains</p>
                      <div className="flex flex-wrap gap-2">
                        {result.threat_intelligence.iocs.domains.map((domain: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="font-mono text-xs">{domain}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.threat_intelligence?.iocs?.behavioral_indicators?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Behavioral Indicators</p>
                      <ul className="space-y-1">
                        {result.threat_intelligence.iocs.behavioral_indicators.map((indicator: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="detection" className="space-y-4 mt-4">
                  {result.threat_intelligence?.detection_rules?.map((rule: any, idx: number) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                          <Badge variant="outline">{rule.platform}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-sm font-medium mb-1">Detection Logic</p>
                          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                            <code>{rule.logic}</code>
                          </pre>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span className="text-sm">Confidence: {rule.confidence}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
