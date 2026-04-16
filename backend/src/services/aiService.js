const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Analyze recent metrics and return AI insights.
 * @param {Array} metricsHistory - Array of metric objects [{cpu, memory, disk, timestamp}]
 * @param {Array} servers - Array of server objects
 * @returns {Object} - AI insights object
 */
async function getAIInsights(metricsHistory, servers) {
  const client = getClient();

  if (!client) {
    return getMockInsights(metricsHistory, servers);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Summarize recent metrics for the prompt
    const recentMetrics = metricsHistory.slice(-30).map(m => ({
      time: new Date(m.timestamp).toISOString(),
      cpu: m.cpu,
      memory: m.memory,
      disk: m.disk,
    }));

    const avgCpu = recentMetrics.reduce((s, m) => s + m.cpu, 0) / recentMetrics.length || 0;
    const avgMem = recentMetrics.reduce((s, m) => s + m.memory, 0) / recentMetrics.length || 0;
    const maxCpu = Math.max(...recentMetrics.map(m => m.cpu));

    const prompt = `
You are a cloud infrastructure AI analyst. Analyze the following server metrics data and provide insights.

Current Infrastructure:
- Number of servers: ${servers.length}
- Average CPU (last 30 readings): ${avgCpu.toFixed(1)}%
- Average Memory (last 30 readings): ${avgMem.toFixed(1)}%
- Peak CPU: ${maxCpu.toFixed(1)}%

Recent CPU trend (last 10 readings): ${recentMetrics.slice(-10).map(m => m.cpu.toFixed(1) + '%').join(', ')}

Provide a JSON response with exactly this structure:
{
  "trend": "rising" | "stable" | "falling",
  "trendDescription": "Brief description of the current trend (1 sentence)",
  "prediction": "CPU usage prediction for the next hour (1 sentence)",
  "recommendation": "Specific scaling or optimization recommendation (1-2 sentences)",
  "riskLevel": "low" | "medium" | "high",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "predictedCpuIn1h": <number 0-100>,
  "shouldScale": true | false,
  "scaleDirection": "up" | "down" | "none"
}

Return only valid JSON, no markdown, no extra text.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getMockInsights(metricsHistory, servers);
  } catch (err) {
    console.error('Gemini AI error:', err.message);
    return getMockInsights(metricsHistory, servers);
  }
}

function getMockInsights(metricsHistory, servers) {
  const recent = metricsHistory.slice(-10);
  const avgCpu = recent.length
    ? recent.reduce((s, m) => s + m.cpu, 0) / recent.length
    : 35;

  let trend = 'stable';
  if (recent.length >= 5) {
    const firstHalf = recent.slice(0, 5).reduce((s, m) => s + m.cpu, 0) / 5;
    const secondHalf = recent.slice(5).reduce((s, m) => s + m.cpu, 0) / 5;
    if (secondHalf > firstHalf + 5) trend = 'rising';
    else if (secondHalf < firstHalf - 5) trend = 'falling';
  }

  return {
    trend,
    trendDescription: `CPU usage is currently ${trend} with an average of ${avgCpu.toFixed(1)}%.`,
    prediction: avgCpu > 70
      ? 'CPU usage is likely to reach critical levels within the next hour if the current trend continues.'
      : 'CPU usage is expected to remain within normal operational bounds over the next hour.',
    recommendation: avgCpu > 75
      ? 'Consider scaling up by adding 1-2 additional servers to distribute the workload.'
      : avgCpu < 30 && servers.length > 1
        ? 'CPU utilization is low. Consider scaling down to reduce infrastructure costs.'
        : 'Current infrastructure capacity is optimal. No immediate scaling action required.',
    riskLevel: avgCpu > 85 ? 'high' : avgCpu > 65 ? 'medium' : 'low',
    insights: [
      `Infrastructure is running ${servers.length} active server(s)`,
      `Memory utilization is within acceptable thresholds`,
      `Network traffic patterns appear normal`,
    ],
    predictedCpuIn1h: Math.round(Math.min(99, Math.max(1, avgCpu + (trend === 'rising' ? 12 : trend === 'falling' ? -8 : 2)))),
    shouldScale: avgCpu > 75 || (avgCpu < 30 && servers.length > 1),
    scaleDirection: avgCpu > 75 ? 'up' : avgCpu < 30 && servers.length > 1 ? 'down' : 'none',
  };
}

module.exports = { getAIInsights };
