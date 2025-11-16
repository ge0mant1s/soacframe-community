'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PolicyAnalyzerComponent } from '@/components/ai/policy-analyzer-component';

export default function PolicyAnalyzerPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Policy Analyzer</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of security policies and detection rules
          </p>
        </div>
      </div>
      <PolicyAnalyzerComponent />
    </div>
  );
}
