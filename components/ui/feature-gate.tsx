
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [feature, session]);

  const checkAccess = async () => {
    if (!session?.user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/access-check?feature=${feature}`);
      const data = await response.json();
      
      setHasAccess(data.allowed);
      setReason(data.reason || '');
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <Alert className="border-primary/50 bg-primary/5">
        <Lock className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Feature Locked
          <Badge variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Upgrade Required
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{reason || 'This feature is not available in your current plan.'}</p>
          <Button onClick={() => router.push('/pricing')} size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Upgrade Options
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export function FeatureUsageBar({ 
  usageType, 
  label 
}: { 
  usageType: string; 
  label: string;
}) {
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, [usageType]);

  const fetchUsage = async () => {
    try {
      const response = await fetch(`/api/usage-check?type=${usageType}`);
      const data = await response.json();
      
      if (data.allowed !== undefined) {
        setUsage({
          current: data.currentUsage || 0,
          limit: data.limit || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) {
    return null;
  }

  const isUnlimited = usage.limit === -1;
  const percentage = isUnlimited ? 0 : (usage.current / usage.limit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isNearLimit ? 'text-orange-600' : ''}`}>
          {usage.current} / {isUnlimited ? '∞' : usage.limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isNearLimit ? 'bg-orange-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
