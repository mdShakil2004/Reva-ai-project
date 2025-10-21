
import html2canvas from "html2canvas";

export const downloadChart = async (chartRef, darkMode, fileName = "chart.png") => {
  if (chartRef.current) {
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
        scale: 2, // Higher resolution for better quality
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error("Error downloading chart:", err);
    }
  }
};