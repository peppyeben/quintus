// components/QuintusMeta.tsx
import { useEffect } from "react";

interface QuintusMetaProps {
    title?: string;
    description?: string;
}

const QuintusMeta = ({
    title = "Quintus - Decentralized Peer-to-Peer Prediction Market",
    description = "Decentralized peer-to-peer prediction market.",
}: QuintusMetaProps) => {
    useEffect(() => {
        // Update primary meta tags
        document.title = title;
        updateMetaTag("title", title);
        updateMetaTag("description", description);

        // Update OpenGraph meta tags
        updateMetaTag("og:title", title, true);
        updateMetaTag("og:description", description, true);

        // Update Twitter meta tags
        updateMetaTag("twitter:title", title, true);
        updateMetaTag("twitter:description", description, true);

        // Cleanup function
        return () => {
            const defaultTitle =
                "Quintus - Decentralized Peer-to-Peer Prediction Market";
            const defaultDesc = "Decentralized peer-to-peer prediction market.";

            document.title = defaultTitle;
            updateMetaTag("title", defaultTitle);
            updateMetaTag("description", defaultDesc);
            updateMetaTag("og:title", defaultTitle, true);
            updateMetaTag("og:description", defaultDesc, true);
            updateMetaTag("twitter:title", defaultTitle, true);
            updateMetaTag("twitter:description", defaultDesc, true);
        };
    }, [title, description]);

    const updateMetaTag = (
        name: string,
        content: string,
        isProperty: boolean = false
    ) => {
        const selector = isProperty
            ? `meta[property="${name}"]`
            : `meta[name="${name}"]`;
        const meta = document.querySelector(selector);

        if (meta) {
            meta.setAttribute("content", content);
        }
    };

    return null;
};

export default QuintusMeta;
