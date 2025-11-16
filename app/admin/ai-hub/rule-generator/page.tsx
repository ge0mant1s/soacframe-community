'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Copy, Download, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface GeneratedRule {
  rule: {
    name: string;
    description: string;
    platform: string;
    type: string;
    severity: string;
    mitre_tactics: string[];
    mitre_techniques: string[];
    query: string;
    correlation_window: string;
    entities: string[];
    threshold: string;
    implementation_notes: string;
    tuning_guidance: string;
    soar_playbook: string;
  };
}

export default function RuleGeneratorPage() {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  const [platform, setPlatform] = useState('');
  const [ruleType, setRuleType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedRule | null>(null);

  const platforms = [
    'SIEM (CQL)',
    'Palo Alto NGFW',
    'Microsoft Sentinel',
    'Splunk',
    'Elastic SIEM',
    'CrowdStrike Falcon',
    'Microsoft Defender',
    'AWS CloudTrail',
    'Azure Activity Log',
    'Generic KQL'
  ];

  const ruleTypes = [
    'Detection Rule',
    'Correlation Rule',
    'Threat Hunting Query',
    'Firewall Policy',
    'Network Policy',
    'SOAR Automation',
    'Compliance Check',
    'Data Exfiltration',
    'Lateral Movement',
    'Privilege Escalation'
  ];

  const examples = [
    {
      title: 'Ransomware Detection',
      text: 'Detect ransomware activity by correlating suspicious email delivery, PowerShell execution, file encryption, and lateral SMB spread across Proofpoint, Falcon, and PAN-OS within a 30-minute window.'
    },
    {
      title: 'Credential Abuse',
      text: 'Identify credential abuse patterns including LDAP/NTLM anomalies, identity persistence, and MFA bypass attempts across EntraID, AD, and Falcon Identity within 10 minutes.'
    },
    {
      title: 'Data Exfiltration',
      text: 'Detect data staging on endpoints, outbound transfers via PAN-OS, and cloud uploads to S3 or Azure Blob Storage within 60 minutes.'
    }
  ];

  const handleGenerate = async () => {
    if (!userInput || !platform || !ruleType) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/rule-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, platform, ruleType })
      });

      if (!response.ok) throw new Error('Failed to generate rule');

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
                setResult(parsed.result as GeneratedRule);
                toast.success('Rule generated successfully!');
                setLoading(false);
                return;
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Generation failed');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate rule');
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!result) return;
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.rule.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Rule downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            AI Rule Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Convert natural language to production-ready security rules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Requirements</CardTitle>
            <CardDescription>Describe what you want to detect in plain English</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rule Type</Label>
              <Select value={ruleType} onValueChange={setRuleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  {ruleTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Detection Requirements</Label>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Example: Detect ransomware by correlating email delivery, PowerShell execution, and file encryption within 30 minutes..."
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Example Scenarios</Label>
              <div className="space-y-2">
                {examples.map((ex, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-auto py-2 px-3 text-left"
                    onClick={() => setUserInput(ex.text)}
                  >
                    <div>
                      <p className="font-medium text-sm">{ex.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ex.text}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading || !userInput || !platform || !ruleType}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Rule...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Rule
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Rule</CardTitle>
            <CardDescription>Your production-ready security rule</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Fill in the requirements and click Generate to create your rule
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Generating your security rule...</p>
              </div>
            )}

            {result && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="query">Query</TabsTrigger>
                  <TabsTrigger value="implementation">Implementation</TabsTrigger>
                  <TabsTrigger value="mitre">MITRE</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Rule Name</Label>
                    <p className="text-lg font-semibold">{result.rule.name}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{result.rule.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Platform</Label>
                      <Badge variant="outline">{result.rule.platform}</Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Severity</Label>
                      <Badge variant={
                        result.rule.severity === 'Critical' ? 'destructive' :
                        result.rule.severity === 'High' ? 'default' : 'secondary'
                      }>{result.rule.severity}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Correlation Window</Label>
                    <p className="text-sm">{result.rule.correlation_window}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Entities</Label>
                    <div className="flex flex-wrap gap-2">
                      {result.rule.entities?.map((entity, idx) => (
                        <Badge key={idx} variant="secondary">{entity}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleCopy(JSON.stringify(result, null, 2))} size="sm" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                    <Button onClick={handleDownload} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="query" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Detection Query</Label>
                      <Button onClick={() => handleCopy(result.rule.query)} size="sm" variant="ghost">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{result.rule.query}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Threshold</Label>
                    <p className="text-sm">{result.rule.threshold}</p>
                  </div>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Implementation Notes</Label>
                    <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                      {result.rule.implementation_notes}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tuning Guidance</Label>
                    <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                      {result.rule.tuning_guidance}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SOAR Playbook</Label>
                    <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                      {result.rule.soar_playbook}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mitre" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">MITRE ATT&CK Tactics</Label>
                    <div className="flex flex-wrap gap-2">
                      {result.rule.mitre_tactics?.map((tactic, idx) => (
                        <Badge key={idx} variant="outline">{tactic}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">MITRE ATT&CK Techniques</Label>
                    <div className="flex flex-wrap gap-2">
                      {result.rule.mitre_techniques?.map((technique, idx) => (
                        <Badge key={idx}>{technique}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
