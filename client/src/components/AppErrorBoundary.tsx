import ErrorBoundary from "./ErrorBoundary";
import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";
import { Button } from "@/components/ui/button";

function AppErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Application Error</h1>
        <p className="text-muted-foreground mb-6">
          CBS LLM Studio encountered an unexpected error. This may be due to a temporary issue.
        </p>
        
        {error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={retry} variant="outline" className="gap-2">
            <FaRedo className="w-4 h-4" />
            Retry
          </Button>
          <Button onClick={handleHome} className="gap-2">
            <FaHome className="w-4 h-4" />
            Go Home
          </Button>
          <Button onClick={handleReload} variant="secondary" className="gap-2">
            Reload App
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}