'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  FileSearch, 
  Shield, 
  Brain, 
  MessagesSquare,
  Zap,
  TrendingUp,
  Lock
} from 'lucide-react';

export default function AIHubPage() {
  const router = useRouter();

  const features = [
    {
      id: 'rule-generator',
      title: 'AI Rule Generator',
      description: 'Convert natural language security requirements into production-ready detection rules for SIEM, firewalls, and EDR platforms.',
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      benefits: ['Natural language to code', 'Multi-platform support', 'MITRE ATT&CK mapping', 'Instant rule generation'],
      path: '/admin/ai-hub/rule-generator'
    },
    {
      id: 'policy-analyzer',
      title: 'Policy Analyzer',
      description: 'Upload existing security policies and rules to get AI-powered analysis, optimization suggestions, and gap identification.',
      icon: FileSearch,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      benefits: ['Identify security gaps', 'Optimization recommendations', 'False positive reduction', 'MITRE coverage analysis'],
      path: '/admin/ai-hub/policy-analyzer'
    },
    {
      id: 'compliance-checker',
      title: 'Compliance Checker',
      description: 'Validate your security configurations against major compliance frameworks including NIST, ISO 27001, CIS, SOC 2, and more.',
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      benefits: ['Multi-framework validation', 'Gap analysis', 'Remediation roadmap', 'Audit-ready reports'],
      path: '/admin/ai-hub/compliance-checker'
    },
    {
      id: 'threat-intel',
      title: 'Threat Intelligence',
      description: 'Get real-time intelligence on emerging threats, IOCs, attack patterns, and defensive strategies tailored to your environment.',
      icon: Brain,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      benefits: ['Emerging threat analysis', 'IOC extraction', 'Detection strategies', 'SOAR playbook generation'],
      path: '/admin/ai-hub/threat-intel'
    },
    {
      id: 'advisor',
      title: 'AI Security Advisor',
      description: 'Interactive AI assistant for SOC teams. Get expert guidance on detection engineering, incident response, and security operations.',
      icon: MessagesSquare,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      benefits: ['24/7 expert guidance', 'Contextual assistance', 'Best practices', 'Troubleshooting support'],
      path: '/admin/ai-hub/advisor'
    }
  ];

  const stats = [
    { label: 'Time Saved', value: '75%', icon: Zap, change: '+12%' },
    { label: 'Detection Accuracy', value: '94%', icon: TrendingUp, change: '+8%' },
    { label: 'Compliance Score', value: '96%', icon: Lock, change: '+15%' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Hub</h1>
        <p className="text-muted-foreground">
          Advanced AI-powered tools to elevate your Security Operations as Code framework
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <span className="text-sm text-green-500 font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${feature.bgColor} mb-4`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Benefits:</p>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  onClick={() => router.push(feature.path)}
                  className="w-full"
                >
                  Launch {feature.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Enterprise-Grade AI Security</h3>
              <p className="text-muted-foreground">
                Built on state-of-the-art language models, trained on security best practices, and optimized for SOC operations.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/ai-hub/advisor')}>
              Talk to AI Advisor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
