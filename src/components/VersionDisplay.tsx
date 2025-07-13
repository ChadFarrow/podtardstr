import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function VersionDisplay() {
  const [commitHash, setCommitHash] = useState<string>('');

  useEffect(() => {
    // Get the commit hash from the build process
    // This will be replaced by Vite during build time
    const hash = import.meta.env.VITE_GIT_COMMIT_HASH || 'dev';
    setCommitHash(hash);
  }, []);

  if (!commitHash || commitHash === 'dev') {
    return null; // Don't show version in development
  }

  return (
    <div className="fixed bottom-2 left-2 z-50">
      <Badge variant="secondary" className="text-xs font-mono">
        {commitHash.substring(0, 7)}
      </Badge>
    </div>
  );
} 