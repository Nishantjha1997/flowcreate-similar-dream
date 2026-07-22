import { Component, Fragment, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { captureError } from '@/lib/monitoring';

interface SectionBoundaryProps {
  children: ReactNode;
  name: string;
}

interface SectionBoundaryState {
  error?: Error;
  retryKey: number;
}

export class SectionBoundary extends Component<SectionBoundaryProps, SectionBoundaryState> {
  state: SectionBoundaryState = { retryKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<SectionBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureError(error, {
      boundary: this.props.name,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState((current) => ({
      error: undefined,
      retryKey: current.retryKey + 1,
    }));
  };

  render() {
    if (this.state.error) {
      return (
        <Card className="m-3 border-amber-300 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/20" role="alert">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              This section hit an error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
              {this.props.name} could not load. Your other work is still available.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try this section again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>;
  }
}
