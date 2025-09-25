import EmbeddableFeedback from "@/components/widget/EmbeddableFeedback";
import { useEffect } from "react";
const WidgetExport = () => {
    // Get configuration from URL parameters
    useEffect(() => {
        // ✅ Make body transparent
        document.body.style.background = "transparent";

        // ✅ Observe size changes and notify parent
        const resizeObserver = new ResizeObserver(() => {
            const height = document.body.scrollHeight;
            window.parent.postMessage(
                { type: "WIDGET_RESIZE", height },
                "*"
            );
        });
        resizeObserver.observe(document.body);

        return () => {
            document.body.style.background = "";
            resizeObserver.disconnect();
        };
    }, []);
    const urlParams = new URLSearchParams(window.location.search);
    const position = (urlParams.get('position') as any) || 'bottom-right';
    const primaryColor = urlParams.get('color') || 'hsl(221.2 83.2% 53.3%)';
    const companyName = urlParams.get('company') || 'Company';

    return (
        // <div className="bg-transparent min-h-screen  max-h-152  overflow-y-auto">
        <div className="bg-transparent min-h-screen  max-h-152  h-auto">
            <EmbeddableFeedback
                position={position}
                primaryColor={primaryColor}
                companyName={companyName}
            />
        </div>
    );
};

export default WidgetExport;