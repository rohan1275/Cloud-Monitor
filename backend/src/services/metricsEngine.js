/**
 * Metrics Simulation Engine
 * Generates realistic CPU/Memory/Disk/Network metrics with trends, spikes, and noise.
 */

// State per server to simulate drift (random walk)
const serverState = new Map();

function getOrInitState(serverId) {
  if (!serverState.has(serverId)) {
    serverState.set(serverId, {
      cpu: 20 + Math.random() * 30,
      memory: 30 + Math.random() * 20,
      disk: 40 + Math.random() * 20,
      networkIn: 100 + Math.random() * 400,
      networkOut: 50 + Math.random() * 200,
      trend: 0, // positive = rising, negative = falling
      spikeCountdown: 0,
    });
  }
  return serverState.get(serverId);
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function randomWalk(value, step, min, max) {
  const delta = (Math.random() - 0.5) * step;
  return clamp(value + delta, min, max);
}

function generateMetric(serverId) {
  const state = getOrInitState(serverId);

  // Occasional traffic spikes
  if (state.spikeCountdown > 0) {
    state.spikeCountdown--;
    state.cpu = clamp(state.cpu + Math.random() * 8, 0, 100);
    state.memory = clamp(state.memory + Math.random() * 4, 0, 100);
  } else if (Math.random() < 0.05) {
    // 5% chance of spike event
    state.spikeCountdown = 3 + Math.floor(Math.random() * 5);
  }

  // Random walk for all metrics
  state.cpu = randomWalk(state.cpu, 5, 2, 99);
  state.memory = randomWalk(state.memory, 3, 10, 98);
  state.disk = clamp(state.disk + Math.random() * 0.05, 5, 95); // disk only grows slowly
  state.networkIn = clamp(state.networkIn + (Math.random() - 0.5) * 100, 10, 2000);
  state.networkOut = clamp(state.networkOut + (Math.random() - 0.5) * 60, 5, 1000);

  // Apply long-term trend
  state.trend += (Math.random() - 0.5) * 0.2;
  state.trend = clamp(state.trend, -1, 1);
  state.cpu = clamp(state.cpu + state.trend, 2, 99);

  return {
    cpu: Math.round(state.cpu * 10) / 10,
    memory: Math.round(state.memory * 10) / 10,
    disk: Math.round(state.disk * 10) / 10,
    networkIn: Math.round(state.networkIn),
    networkOut: Math.round(state.networkOut),
  };
}

function resetServerState(serverId) {
  serverState.delete(serverId);
}

module.exports = { generateMetric, resetServerState };
