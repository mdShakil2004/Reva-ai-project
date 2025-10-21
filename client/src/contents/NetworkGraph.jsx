import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";

const NetworkGraph = ({ graphData, isTree = false }) => {
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    if (!graphData) return;
    try {
      const data = JSON.parse(graphData);

      // Dynamic node sizing
      if (data.nodes && data.edges) {
        const nodeDegrees = data.nodes.reduce((acc, node) => {
          acc[node.id] = 0;
          return acc;
        }, {});
        data.edges.forEach(edge => {
          nodeDegrees[edge.from] += 1;
          nodeDegrees[edge.to] += 1;
        });

        data.nodes = data.nodes.map(node => ({
          ...node,
          size: 30 + (nodeDegrees[node.id] || 0) * 2,
          color: {
            background: isTree ? "#047857" : "#1E40AF",
            border: isTree ? "#10B981" : "#2563EB",
            highlight: {
              background: isTree ? "#34D399" : "#3B82F6",
              border: isTree ? "#6EE7B7" : "#60A5FA",
            },
            hover: {
              background: isTree ? "#34D399" : "#3B82F6",
              border: isTree ? "#6EE7B7" : "#60A5FA",
            },
          },
          font: { size: 14, color: "#ffffff", face: "Arial" },
          borderWidth: 2,
        }));

        data.edges = data.edges.map(edge => ({
          ...edge,
          color: { color: "#888", highlight: "#2563EB", hover: "#2563EB" },
          width: 2,
          smooth: { type: "dynamic", roundness: 0.3 },
          arrows: isTree ? { to: true } : undefined,
        }));
      }

      setParsedData(data);
    } catch (error) {
    //   console.error("Invalid Graph JSON:", error);
      setParsedData(null);
    }
  }, [graphData, isTree]);

  if (!parsedData) return <div className="text-white">Loading...</div>;

  const graphOptions = {
    layout: { hierarchical: isTree },
    physics: {
      enabled: true,
      stabilization: true,
      barnesHut: { gravitationalConstant: -2000, springLength: 90, springConstant: 0.1 },
    },
    interaction: {
      dragNodes: true,
      dragView: false,
      zoomView: false,
      hover: true,
      tooltipDelay: 200,
    },
    nodes: { borderWidth: 2 },
    edges: { smooth: true },
  };

  return (
    <div className="w-full my-4 rounded-lg border border-gray-800 relative " style={{ height: "550px" }}>
      <Graph graph={parsedData} options={graphOptions} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default NetworkGraph;
