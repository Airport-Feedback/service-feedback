import { useState } from "react";
import { Copy, Check, Code, Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

//
// Code snippets data
//
const getCodeSnippets = (htmlSnippet: string, javascriptSnippet: string, reactSnippet: string, typescriptSnippet: string, iframeCode: string, simpleReactSnippet: string) => [
  {
    id: "html",
    title: "Static HTML Website",
    description: "For traditional HTML websites",
    code: htmlSnippet,
    language: "html",
  },
  {
    id: "javascript",
    title: "Vanilla JavaScript",
    description: "Dynamic loading with pure JavaScript",
    code: javascriptSnippet,
    language: "javascript",
  },
  {
    id: "simpleReact",
    title: "Simple React",
    description: "Simple way to integrate in any React based app",
    code: simpleReactSnippet,
    language: "react",
  },
  {
    id: "react",
    title: "React / Next.js",
    description: "React hook and component implementation",
    code: reactSnippet,
    language: "javascript",
  },
  {
    id: "typescript",
    title: "TypeScript",
    description: "TypeScript implementation with type safety",
    code: typescriptSnippet,
    language: "typescript",
  },
  {
    id: "iframe",
    title: "iFrame Integration",
    description: "Direct iframe embed for maximum control",
    code: iframeCode,
    language: "html",
  },
];

//
// Main WidgetInstructions component
//
const WidgetInstructions = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [position, setPosition] = useState("bottom-right");
  const [color, setColor] = useState("#365fb8");
  const [companyName, setCompanyName] = useState("Your Company");

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // const currentUrl = window.location.origin + "/happy-flow-sync";
  const currentUrl = window.location.origin;

  const embedScript = `<script>
  window.FeedbackWidgetConfig = {
    position: '${position}',
    primaryColor: '${encodeURIComponent(color)}',
    companyName: '${companyName}',
    baseUrl: '${currentUrl}'
  };
</script>
<script src="${currentUrl}/embed.js"></script>`;

  const iframeCode = `<iframe 
  src="${currentUrl}/widget-export?position=${position}&color=${encodeURIComponent(color)}&company=${encodeURIComponent(
    companyName
  )}" 
  style="position: fixed; ${position.includes("bottom") ? "bottom: 16px;" : "top: 16px;"
    } ${position.includes("right") ? "right: 16px;" : "left: 16px;"} width: 100%; height: 100%; border: none; z-index: 999999; pointer-events: none; background: transparent;" 
  onload="this.style.pointerEvents='auto'">
</iframe>`;

  // full snippets
  const htmlSnippet = `<!DOCTYPE html>
<html>
  <head>
    <title>Feedback Widget Example</title>
  </head>
  <body>
    <h1>My Website</h1>
    <script>
      window.FeedbackWidgetConfig = {
        position: '${position}',
        primaryColor: '${color}',
        companyName: '${companyName}',
        baseUrl: '${currentUrl}'
      };
    </script>
    <script src="${currentUrl}/embed.js"></script>
  </body>
</html>`;

  const javascriptSnippet = `// Initialize Feedback Widget
(function() {
  const script = document.createElement('script');
  script.src = '${currentUrl}/embed.js';
  script.async = true;
  script.onload = function() {
    window.FeedbackWidgetConfig = {
      position: '${position}',
      primaryColor: '${color}',
      companyName: '${companyName}',
      baseUrl: '${currentUrl}'
    };
  };
  document.head.appendChild(script);
})();`;
  const simpleReactSnippet = `import { useEffect } from "react";
  export const FeedbackWidget = () => {
    useEffect(() => {
      const iframe = document.createElement("iframe");
      iframe.id = "feedback-widget-iframe";
      iframe.src = "${currentUrl}/widget-export?position=${position}&color=${encodeURIComponent(color)}&company=${encodeURIComponent(companyName)}";
      iframe.style.position = "fixed";
      iframe.style.zIndex = "999999";
      iframe.style.border = "none";
      iframe.style.width = "345px";
      iframe.style.height = "400px";

      if ("${position}".includes("bottom")) {
        iframe.style.bottom = "16px";
      } else {
        iframe.style.top = "16px";
      }
      if ("${position}".includes("right")) {
        iframe.style.right = "16px";
      } else {
        iframe.style.left = "16px";
      }

      document.body.appendChild(iframe);

      return () => {
        const el = document.getElementById("feedback-widget-iframe");
        if (el && el.parentNode) el.parentNode.removeChild(el);
      };
    }, []);

    return null;
  };`;
  const reactSnippets = [
    {
      step: 1,
      title: "Create the Feedback Widget Hook",
      description: "First, create a custom hook to manage the widget lifecycle. This hook will handle loading the script and cleaning up when the component unmounts.",
      filename: "hooks/useFeedbackWidget.js",
      code: `import { useEffect } from 'react';

export function useFeedbackWidget({ 
  position = '${position}', 
  color = '${color}', 
  companyName = '${companyName}' 
}) {
  useEffect(() => {
    // Configure the widget before loading the script
    window.FeedbackWidgetConfig = {
      position,
      primaryColor: color,
      companyName,
      baseUrl: '${currentUrl}'
    };

    // Create and load the widget script
    const script = document.createElement('script');
    script.src = '${currentUrl}/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      script.remove();
    };
  }, [position, color, companyName]);
}`
    },
    {
      step: 2,
      title: "Use the Hook in Your App Component",
      description: "Import and use the hook in your main App component or any component where you want the feedback widget to appear.",
      filename: "App.js",
      code: `import { useFeedbackWidget } from './hooks/useFeedbackWidget';

function App() {
  // Initialize the feedback widget with default settings
  useFeedbackWidget({});
  
  // Or customize the widget settings
  // useFeedbackWidget({
  //   position: 'bottom-left',
  //   color: '#ff6b6b',
  //   companyName: 'My Awesome Company'
  // });

  return (
    <div className="App">
      <header>
        <h1>Welcome to My App</h1>
      </header>
      <main>
        {/* Your app content here */}
        <p>The feedback widget will appear automatically!</p>
      </main>
    </div>
  );
}

export default App;`
    },
    {
      step: 3,
      title: "Advanced Usage with State Management",
      description: "For more advanced scenarios, you can manage widget settings through your app's state management system.",
      filename: "components/FeedbackProvider.js",
      code: `import { createContext, useContext, useState } from 'react';
import { useFeedbackWidget } from '../hooks/useFeedbackWidget';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [widgetConfig, setWidgetConfig] = useState({
    position: '${position}',
    color: '${color}',
    companyName: '${companyName}'
  });

  // Initialize widget with current config
  useFeedbackWidget(widgetConfig);

  const updateWidgetConfig = (newConfig) => {
    setWidgetConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <FeedbackContext.Provider value={{ widgetConfig, updateWidgetConfig }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export const useFeedbackConfig = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedbackConfig must be used within FeedbackProvider');
  }
  return context;
};`
    }
  ];

  const typescriptSnippets = [
    {
      step: 1,
      title: "Create Type Definitions",
      description: "First, create proper TypeScript interfaces for type safety. This ensures your widget configuration is properly typed.",
      filename: "types/feedback-widget.d.ts",
      code: `// Global type declarations for the feedback widget
declare global {
  interface Window {
    FeedbackWidgetConfig?: {
      position: string;
      primaryColor: string;
      companyName: string;
      baseUrl: string;
    };
  }
}

// Widget configuration interface
export interface WidgetOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: string;
  companyName?: string;
}

// Export empty object to make this a module
export {};`
    },
    {
      step: 2,
      title: "Create Typed Hook",
      description: "Create a strongly typed hook that ensures type safety for all widget configurations and provides better IDE support.",
      filename: "hooks/useFeedbackWidget.ts",
      code: `import { useEffect } from 'react';
import type { WidgetOptions } from '../types/feedback-widget';

export function useFeedbackWidget({ 
  position = '${position}', 
  color = '${color}', 
  companyName = '${companyName}' 
}: WidgetOptions = {}) {
  useEffect(() => {
    // Type-safe configuration
    window.FeedbackWidgetConfig = {
      position,
      primaryColor: color,
      companyName,
      baseUrl: '${currentUrl}'
    };

    // Create and load the widget script
    const script = document.createElement('script');
    script.src = '${currentUrl}/embed.js';
    script.async = true;
    script.onerror = () => {
      console.error('Failed to load feedback widget script');
    };
    
    document.body.appendChild(script);

    // Cleanup function with proper typing
    return (): void => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [position, color, companyName]);
}`
    },
    {
      step: 3,
      title: "Use in TypeScript Component",
      description: "Implement the hook in your main TypeScript component with full type safety and error handling.",
      filename: "App.tsx",
      code: `import React from 'react';
import { useFeedbackWidget } from './hooks/useFeedbackWidget';
import type { WidgetOptions } from './types/feedback-widget';

const App: React.FC = () => {
  // Basic usage with default settings
  useFeedbackWidget();
  
  // Or with custom configuration
  // const widgetConfig: WidgetOptions = {
  //   position: 'bottom-left',
  //   color: '#2563eb',
  //   companyName: 'My TypeScript App'
  // };
  // useFeedbackWidget(widgetConfig);

  return (
    <div className="app">
      <header>
        <h1>My TypeScript Application</h1>
      </header>
      <main>
        <p>
          Feedback widget will load automatically with full type safety!
        </p>
      </main>
    </div>
  );
};

export default App;`
    },
    {
      step: 4,
      title: "Advanced Context Provider (Optional)",
      description: "For complex applications, create a context provider with full TypeScript support for managing widget state across components.",
      filename: "providers/FeedbackProvider.tsx",
      code: `import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useFeedbackWidget } from '../hooks/useFeedbackWidget';
import type { WidgetOptions } from '../types/feedback-widget';

interface FeedbackContextType {
  widgetConfig: Required<WidgetOptions>;
  updateWidgetConfig: (config: Partial<WidgetOptions>) => void;
  isWidgetEnabled: boolean;
  toggleWidget: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

interface FeedbackProviderProps {
  children: ReactNode;
  defaultConfig?: WidgetOptions;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ 
  children, 
  defaultConfig = {} 
}) => {
  const [widgetConfig, setWidgetConfig] = useState<Required<WidgetOptions>>({
    position: '${position}',
    color: '${color}',
    companyName: '${companyName}',
    ...defaultConfig
  });
  
  const [isWidgetEnabled, setIsWidgetEnabled] = useState(true);

  // Only initialize widget if enabled
  useFeedbackWidget(isWidgetEnabled ? widgetConfig : undefined);

  const updateWidgetConfig = (newConfig: Partial<WidgetOptions>): void => {
    setWidgetConfig(prev => ({ ...prev, ...newConfig }));
  };

  const toggleWidget = (): void => {
    setIsWidgetEnabled(prev => !prev);
  };

  const contextValue: FeedbackContextType = {
    widgetConfig,
    updateWidgetConfig,
    isWidgetEnabled,
    toggleWidget
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedbackConfig = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedbackConfig must be used within FeedbackProvider');
  }
  return context;
};`
    }
  ];

  const getCodeSnippets = (htmlSnippet: string, javascriptSnippet: string, iframeCode: string, simpleReactSnippet: string) => [
    {
      id: "html",
      title: "Static HTML Website",
      description: "For traditional HTML websites",
      code: htmlSnippet,
      language: "html",
    },
    {
      id: "simpleReact",
      title: "Simple React",
      description: "Simple way to integrate in any React based app",
      code: simpleReactSnippet,
      language: "react",
    },
    {
      id: "javascript",
      title: "Vanilla JavaScript",
      description: "Dynamic loading with pure JavaScript",
      code: javascriptSnippet,
      language: "javascript",
    },
    {
      id: "iframe",
      title: "iFrame Integration",
      description: "Direct iframe embed for maximum control",
      code: iframeCode,
      language: "html",
    },
  ];

  const codeSnippets = getCodeSnippets(htmlSnippet, javascriptSnippet, iframeCode, simpleReactSnippet);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Feedback Widget Integration</h1>
            <p className="text-muted-foreground">
              Embed our feedback widget on your website to collect customer feedback seamlessly
            </p>
          </div>

          {/* Outer Tabs */}
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configuration" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration & Preview
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Integration Code
              </TabsTrigger>
            </TabsList>

            {/* Config Tab */}
            <TabsContent value="configuration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Widget Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your widget settings and see the live preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select value={position} onValueChange={setPosition}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="#365fb8"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your Company"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-semibold mb-2">Live Preview:</h4>
                    <div className="relative bg-gray-100 rounded-lg h-64 overflow-hidden">
                      <iframe
                        src={`${currentUrl}/widget?position=${position}&color=${encodeURIComponent(color)}&company=${encodeURIComponent(companyName)}`}
                        className="w-full h-full border-none"
                        title="Widget Preview"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integration Tab */}
            <TabsContent value="integration" className="space-y-6">
              {/* Quick Start */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start - Script Tag (Recommended)</CardTitle>
                  <CardDescription>The easiest way to add the widget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{embedScript}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(embedScript, "script")}
                      >
                        {copied === "script" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform-Specific Integration Snippets */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Simple Integration</h3>
                {codeSnippets.map((snippet) => (
                  <Card key={snippet.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {snippet.title}
                        <Badge variant="outline">{snippet.language}</Badge>
                      </CardTitle>
                      <CardDescription>{snippet.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-80">
                            <code>{snippet.code}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(snippet.code, snippet.id)}
                          >
                            {copied === snippet.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {snippet.id === "iframe" && (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800">Note:</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              The iframe approach gives you direct control but requires manual positioning.
                              The script tag method is recommended for most use cases.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* React Integration Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">React / Next.js Integration (Step-by-Step)</h3>
                <p className="text-muted-foreground text-sm">
                  Follow these steps to integrate the feedback widget into your React or Next.js application with proper hooks and state management.
                </p>
                {reactSnippets.map((snippet) => (
                  <Card key={snippet.step}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">Step {snippet.step}</Badge>
                          {snippet.title}
                        </div>
                        <Badge variant="outline">javascript</Badge>
                      </CardTitle>
                      <CardDescription>{snippet.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Code className="w-4 h-4" />
                          <span className="font-mono">{snippet.filename}</span>
                        </div>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                            <code>{snippet.code}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(snippet.code, `react-step-${snippet.step}`)}
                          >
                            {copied === `react-step-${snippet.step}` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* TypeScript Integration Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">TypeScript Integration (Step-by-Step)</h3>
                <p className="text-muted-foreground text-sm">
                  Implement the feedback widget in TypeScript with full type safety, proper interfaces, and advanced error handling.
                </p>
                {typescriptSnippets.map((snippet) => (
                  <Card key={snippet.step}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">Step {snippet.step}</Badge>
                          {snippet.title}
                        </div>
                        <Badge variant="outline">typescript</Badge>
                      </CardTitle>
                      <CardDescription>{snippet.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Code className="w-4 h-4" />
                          <span className="font-mono">{snippet.filename}</span>
                        </div>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                            <code>{snippet.code}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(snippet.code, `typescript-step-${snippet.step}`)}
                          >
                            {copied === `typescript-step-${snippet.step}` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WidgetInstructions;
