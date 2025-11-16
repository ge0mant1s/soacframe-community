'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSearch, Loader2, Download, Copy, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface PolicyAnalysis {
  analysis: {
    executive_summary: string;
    risk_score: number;
    security_gaps: Array<{
      title: string;
      severity: string;
      description: string;
      impact: string;
      recommendation: string;
    }>;
    optimizations: Array<{
      title: string;
      priority: string;
      current_state: string;
      proposed_state: string;
      expected_benefit: string;
    }>;
    mitre_coverage: {
      covered_tactics: string[];
      covered_techniques: string[];
      missing_tactics: string[];
      missing_techniques: string[];
    };
    compliance: {
      nist?: { covered: string[]; missing: string[] };
      iso27001?: { covered: string[]; missing: string[] };
      cis?: { covered: string[]; missing: string[] };
    };
    false_positive_risk: {
      overall_risk: string;
      high_risk_rules: Array<{
        rule_name: string;
        reason: string;
        mitigation: string;
      }>;
    };
    quick_wins: Array<{
      action: string;
      effort: string;
      impact: string;
    }>;
    detailed_findings: string;
  };
}

export function PolicyAnalyzerComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PolicyAnalysis | null>(null);
  const [progress, setProgress] = useState(0);

  const analysisTypes = [
    'Security Gap Analysis',
    'Performance Optimization',
    'False Positive Reduction',
    'MITRE ATT&CK Coverage',
    'Compliance Assessment',
    'Comprehensive Review'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !analysisType) {
      toast.error('Please select a file and analysis type');
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 95));
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('analysisType', analysisType);

      const response = await fetch('/api/ai/policy-analyzer', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to analyze policy');

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
            if (data === '[DONE]') {
              clearInterval(progressInterval);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.status === 'completed') {
                setResult(parsed.result as PolicyAnalysis);
                setProgress(100);
                clearInterval(progressInterval);
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
      toast.error('Failed to analyze policy');
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-500';
    if (score >= 5) return 'text-orange-500';
    return 'text-green-500';
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Policy</CardTitle>
          <CardDescription>Upload your security rules or policy file for AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Analysis Type</Label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue placeholder="Select analysis type" />
              </SelectTrigger>
              <SelectContent>
                {analysisTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Policy File</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.json,.yaml,.yml,.xml,.csv"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports TXT, JSON, YAML, XML, CSV files
                </p>
              </label>
            </div>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !file || !analysisType}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4 mr-2" />
                Analyze Policy
              </>
            )}
          </Button>

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">{progress}% complete</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>AI-powered security policy analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="gaps">Gaps</TabsTrigger>
                <TabsTrigger value="optimizations">Optimize</TabsTrigger>
                <TabsTrigger value="mitre">MITRE</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                          <p className={`text-4xl font-bold mt-1 ${getRiskColor(result.analysis.risk_score)}`}>
                            {result.analysis.risk_score}/10
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${result.analysis.risk_score >= 8 ? 'bg-red-500/10' : result.analysis.risk_score >= 5 ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
                          <TrendingUp className={`w-8 h-8 ${getRiskColor(result.analysis.risk_score)}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Security Gaps</p>
                        <div className="space-y-2">
                          {['Critical', 'High', 'Medium'].map(severity => {
                            const count = result.analysis.security_gaps?.filter(g => g.severity === severity).length || 0;
                            return (
                              <div key={severity} className="flex items-center justify-between">
                                <Badge variant={getSeverityVariant(severity)}>{severity}</Badge>
                                <span className="font-semibold">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label>Executive Summary</Label>
                  <div className="bg-muted p-4 rounded-lg text-sm">
                    {result.analysis.executive_summary}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Wins</Label>
                  <div className="space-y-2">
                    {result.analysis.quick_wins?.map((win, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium">{win.action}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">Effort: {win.effort}</Badge>
                                <Badge variant="secondary">Impact: {win.impact}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gaps" className="space-y-4 mt-6">
                {result.analysis.security_gaps?.map((gap, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{gap.title}</CardTitle>
                        <Badge variant={getSeverityVariant(gap.severity)}>{gap.severity}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm">Description</Label>
                        <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
                      </div>
                      <div>
                        <Label className="text-sm">Impact</Label>
                        <p className="text-sm text-muted-foreground mt-1">{gap.impact}</p>
                      </div>
                      <div>
                        <Label className="text-sm">Recommendation</Label>
                        <p className="text-sm mt-1">{gap.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="optimizations" className="space-y-4 mt-6">
                {result.analysis.optimizations?.map((opt, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{opt.title}</CardTitle>
                        <Badge>{opt.priority} Priority</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Current State</Label>
                          <p className="text-sm text-muted-foreground mt-1">{opt.current_state}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Proposed State</Label>
                          <p className="text-sm text-green-600 mt-1">{opt.proposed_state}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Expected Benefit</Label>
                        <p className="text-sm font-medium mt-1">{opt.expected_benefit}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="mitre" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Covered Tactics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.mitre_coverage?.covered_tactics?.map((tactic, idx) => (
                          <Badge key={idx} variant="secondary">{tactic}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Missing Tactics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.mitre_coverage?.missing_tactics?.map((tactic, idx) => (
                          <Badge key={idx} variant="destructive">{tactic}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4 mt-6">
                {Object.entries(result.analysis.compliance || {}).map(([framework, data]) => (
                  <Card key={framework}>
                    <CardHeader>
                      <CardTitle className="text-lg uppercase">{framework}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Covered Controls ({data.covered?.length || 0})
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {data.covered?.map((ctrl: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{ctrl}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Missing Controls ({data.missing?.length || 0})
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {data.missing?.map((ctrl: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">{ctrl}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
