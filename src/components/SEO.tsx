import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    product?: {
        name: string;
        price: number;
        salePrice?: number | null;
        image: string;
        sku: string;
        brand: string;
        category: string;
        inStock: boolean;
        description: string;
    };
}

const BASE_TITLE = "PRO FIT";
const SITE_URL = "https://pro-fit.fit";

/**
 * Enhanced SEO manager — sets <title>, meta description,
 * OpenGraph tags, and JSON-LD structured data for products.
 */
export default function SEO({ title, description, image, url, product }: SEOProps) {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

        // ── Meta Description ──
        let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        const prevDesc = metaDesc?.content || "";
        if (description) {
            if (!metaDesc) {
                metaDesc = document.createElement("meta");
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = description;
        }

        // ── OpenGraph Tags ──
        const ogTags: Record<string, string> = {};
        if (title) ogTags["og:title"] = `${title} | ${BASE_TITLE}`;
        if (description) ogTags["og:description"] = description;
        if (image) ogTags["og:image"] = image;
        ogTags["og:url"] = url || window.location.href;
        ogTags["og:type"] = product ? "product" : "website";
        ogTags["og:site_name"] = BASE_TITLE;
        ogTags["og:locale"] = "ar_EG";

        // Product-specific OG tags
        if (product) {
            ogTags["product:price:amount"] = String(product.salePrice ?? product.price);
            ogTags["product:price:currency"] = "EGP";
            ogTags["product:brand"] = product.brand;
            ogTags["product:availability"] = product.inStock ? "in stock" : "out of stock";
        }

        const createdOgTags: HTMLMetaElement[] = [];
        Object.entries(ogTags).forEach(([property, content]) => {
            let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
            if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("property", property);
                document.head.appendChild(tag);
                createdOgTags.push(tag);
            }
            tag.content = content;
        });

        // ── JSON-LD Structured Data (Product) ──
        let jsonLdScript: HTMLScriptElement | null = null;
        if (product) {
            jsonLdScript = document.createElement("script");
            jsonLdScript.type = "application/ld+json";
            jsonLdScript.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: product.name,
                description: product.description,
                image: product.image,
                sku: product.sku,
                brand: {
                    "@type": "Brand",
                    name: product.brand,
                },
                category: product.category,
                offers: {
                    "@type": "Offer",
                    url: url || window.location.href,
                    priceCurrency: "EGP",
                    price: product.salePrice ?? product.price,
                    availability: product.inStock
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                    seller: {
                        "@type": "Organization",
                        name: BASE_TITLE,
                    },
                },
            });
            document.head.appendChild(jsonLdScript);
        }

        return () => {
            document.title = prevTitle;
            if (metaDesc) metaDesc.content = prevDesc;
            createdOgTags.forEach(tag => tag.remove());
            if (jsonLdScript) jsonLdScript.remove();
        };
    }, [title, description, image, url, product]);

    return null;
}
