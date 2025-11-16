'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Shield, Loader2, Download, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ComplianceCheckerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [framework, setFramework] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const frameworks = [
    { value: 'nist', label: 'NIST CSF 2.0' },
    { value: 'iso27001', label: 'ISO/IEC 27001:2022' },
    { value: 'cis', label: 'CIS Controls v8' },
    { value: 'soc2', label: 'SOC 2' },
    { value: 'pci-dss', label: 'PCI DSS 4.0' },
    { value: 'hipaa', label: 'HIPAA Security Rule' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCheck = async () => {
    if (!file || !framework) {
      toast.error('Please select a file and framework');
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
      formData.append('framework', framework);

      const response = await fetch('/api/ai/compliance-checker', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to check compliance');

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
                setResult(parsed.result);
                setProgress(100);
                clearInterval(progressInterval);
                toast.success('Compliance check completed!');
                setLoading(false);
                return;
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Check failed');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to check compliance');
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-green-500';
    if (grade === 'B') return 'text-blue-500';
    if (grade === 'C') return 'text-yellow-500';
    return 'text-red-500';
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
            <Shield className="w-8 h-8 text-green-500" />
            Compliance Checker
          </h1>
          <p className="text-muted-foreground mt-1">
            Validate security configurations against compliance frameworks
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Assessment</CardTitle>
          <CardDescription>Upload your configuration and select a compliance framework</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Compliance Framework</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.value} value={fw.value}>{fw.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Configuration File</Label>
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
            onClick={handleCheck} 
            disabled={loading || !file || !framework}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking Compliance...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Check Compliance
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                    <p className="text-4xl font-bold mt-1">{result.compliance_check?.overall_score || 0}%</p>
                  </div>
                  <div className={`text-6xl font-bold ${getGradeColor(result.compliance_check?.grade || 'F')}`}>
                    {result.compliance_check?.grade || 'F'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                    <p className="text-3xl font-bold mt-1">{result.compliance_check?.compliant_controls?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Non-Compliant</p>
                    <p className="text-3xl font-bold mt-1">{result.compliance_check?.non_compliant_controls?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{result.compliance_check?.summary || ''}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critical Gaps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.compliance_check?.critical_gaps?.map((gap: any, idx: number) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                  <h4 className="font-semibold mb-1">{gap.gap}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{gap.business_impact}</p>
                  <div className="flex gap-2">
                    <Badge variant="destructive">{gap.priority}</Badge>
                    <Badge variant="outline">{gap.effort} Effort</Badge>
                  </div>
                  <p className="text-sm mt-2 font-medium">✓ {gap.recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
