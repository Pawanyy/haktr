import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface OnionLayer {
    name: string;
    description: string;
    components: string[];
}

interface D3OnionChartProps {
    data: Record<string, OnionLayer>;
    onLayerSelect: (layer: string) => void;
}

const D3OnionChart: React.FC<D3OnionChartProps> = ({ data, onLayerSelect }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });

    useEffect(() => {
        const updateDimensions = () => {
            if (svgRef.current) {
                const { width } = svgRef.current.getBoundingClientRect();
                setDimensions({ width: width, height: width });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        const layers = Object.keys(data).reverse();
        const layerWidth = radius / layers.length;

        layers.forEach((layer, i) => {
            const layerRadius = radius - i * layerWidth;

            // Draw layer circle
            g.append("circle")
                .attr("r", layerRadius)
                .attr("fill", colorScale(i.toString()) as string)
                .attr("stroke", "#333")
                .attr("stroke-width", 2)
                .attr("opacity", 0.7)
                .on("click", () => onLayerSelect(layer));

            // Add layer name
            g.append("text")
                .attr("y", -layerRadius + 20)
                .attr("text-anchor", "middle")
                .attr("font-size", 14)
                .attr("font-weight", "bold")
                .text(data[layer].name)
                .on("click", () => onLayerSelect(layer));
        });

    }, [data, dimensions, onLayerSelect]);

    return (
        <div className="w-full aspect-square">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                className="max-w-[700px] mx-auto"
            />
        </div>
    );
};

export default D3OnionChart;

