import EmbeddableFeedback from "@/components/widget/EmbeddableFeedback";

const Widget = () => {
  // Get configuration from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const position = (urlParams.get('position') as any) || 'bottom-right';
  const primaryColor = urlParams.get('color') || 'hsl(221.2 83.2% 53.3%)';
  const companyName = urlParams.get('company') || 'Company';

  return (
    <div className="min-h-screen bg-transparent">
      <EmbeddableFeedback 
        position={position}
        primaryColor={primaryColor}
        companyName={companyName}
      />
    </div>
  );
};

export default Widget;