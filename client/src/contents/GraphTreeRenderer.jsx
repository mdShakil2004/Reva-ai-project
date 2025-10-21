import React from "react";
import NetworkGraph from "./NetworkGraph";

const GraphTreeRenderer = ({ block }) => {
  if (!block || !block.content) return null;

  try {
    const parsedData = JSON.parse(block.content);

    // Determine which types are present
    const types = [];
    if (block.type === "graph") types.push("graph");
    if (block.type === "tree") types.push("tree");

    // If content contains multiple types, handle them
    // For example, parsedData could be an array of { type: "graph" | "tree", data: {} }
    if (Array.isArray(parsedData)) {
      return parsedData.map((item, index) => (
        <NetworkGraph
          key={index}
          graphData={JSON.stringify(item.data)}
          isTree={item.type === "tree"}
        />
      ));
    }

    // If single type
    if (types.length === 1) {
      return (
        <NetworkGraph
          graphData={block.content}
          isTree={types[0] === "tree"}
        />
      );
    }

    // If block.type is "graph" or "tree" but not array, render as graph by default
    return <NetworkGraph graphData={block.content} isTree={block.type === "tree"} />;
  } catch (error) {
    alert("server issue try again");
    return (
      <div className="w-full p-4 bg-red-50 text-red-600 rounded">
        Invalid graph/tree data
      </div>
    );
  }
};

export default GraphTreeRenderer;
