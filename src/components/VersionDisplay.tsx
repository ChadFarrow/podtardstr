import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

// Version number - increment this for releases
const APP_VERSION = '1.25';

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

  const githubUrl = `https://github.com/ChadFarrow/podtardstr/commit/${commitHash}`;

  return (
    <div className="mt-2 space-y-1">
      <div className="text-xs text-muted-foreground">
        Version {APP_VERSION}
      </div>
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
      >
        <Badge variant="secondary" className="text-xs font-mono cursor-pointer">
          {commitHash.substring(0, 7)}
          <ExternalLink className="h-3 w-3 ml-1" />
        </Badge>
      </a>
    </div>
  );
} 