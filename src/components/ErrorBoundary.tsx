import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary — catches unhandled render errors
 * and shows a friendly recovery UI instead of a blank screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex flex-col items-center justify-center px-6 font-cairo text-center bg-background">
                    <div className="text-6xl mb-4">😵</div>
                    <h1 className="text-2xl font-black mb-2">حدث خطأ غير متوقع</h1>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        عذراً، حدث خطأ أثناء تحميل الصفحة. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={this.handleReset}
                            className="px-6 py-2.5 bg-foreground text-background font-bold text-sm"
                        >
                            حاول مرة أخرى
                        </button>
                        <button
                            onClick={() => { window.location.href = "/"; }}
                            className="px-6 py-2.5 border border-border font-bold text-sm"
                        >
                            الرئيسية
                        </button>
                    </div>
                    {process.env.NODE_ENV === "development" && this.state.error ? (
                        <pre className="mt-6 text-xs text-left bg-destructive/10 text-destructive p-4 max-w-lg overflow-auto rounded">
                            {this.state.error.message}
                            {"\n"}
                            {this.state.error.stack}
                        </pre>
                    ) : null}
                </div>
            );
        }

        return this.props.children;
    }
}
