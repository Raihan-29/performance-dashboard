import { useEffect, useMemo, useRef, useState } from "react";

import {
  Activity,
  BarChart3,
  Database,
  Zap,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import type { DataPoint } from "./types/data";

import "./App.css";

function App() {
  // --------------------------------------------------
  // DATASET STATE
  // --------------------------------------------------

  const [dataSize, setDataSize] = useState<number>(10000);

  const [data, setData] = useState<DataPoint[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Web Worker reference
  const workerRef = useRef<Worker | null>(null);

  // --------------------------------------------------
  // CREATE WEB WORKER
  // --------------------------------------------------

  useEffect(() => {
    const worker = new Worker(
      new URL("./workers/dataWorker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    workerRef.current = worker;

    // Receive generated data from worker
    worker.onmessage = (
      event: MessageEvent<DataPoint[]>
    ) => {
      setData(event.data);
      setIsLoading(false);
    };

    // Worker error handling
    worker.onerror = (error) => {
      console.error("Web Worker error:", error);
      setIsLoading(false);
    };

    // Cleanup worker when component unmounts
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // --------------------------------------------------
  // GENERATE DATA WHEN DATASET SIZE CHANGES
  // --------------------------------------------------

  useEffect(() => {
    if (!workerRef.current) {
      return;
    }

    setIsLoading(true);

    workerRef.current.postMessage(dataSize);
  }, [dataSize]);

  // --------------------------------------------------
  // TOTAL VALUE
  // --------------------------------------------------

  const totalValue = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + item.value,
      0
    );
  }, [data]);

  // --------------------------------------------------
  // AVERAGE VALUE
  // --------------------------------------------------

  const averageValue = useMemo(() => {
    if (data.length === 0) {
      return 0;
    }

    return totalValue / data.length;
  }, [data, totalValue]);

  // --------------------------------------------------
  // LINE CHART DATA
  // --------------------------------------------------
  // We do NOT render all 500,000 points.
  // Only a representative sample is displayed.
  // This keeps Recharts fast.
  // --------------------------------------------------

  const chartData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    const maxPoints = 100;

    if (data.length <= maxPoints) {
      return data.map((item, index) => ({
        index: index + 1,
        value: item.value,
      }));
    }

    const step = Math.ceil(data.length / maxPoints);

    return data
      .filter((_, index) => index % step === 0)
      .slice(0, maxPoints)
      .map((item, index) => ({
        index: index + 1,
        value: item.value,
      }));
  }, [data]);

  // --------------------------------------------------
  // CATEGORY DISTRIBUTION
  // --------------------------------------------------

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};

    data.forEach((item) => {
      counts[item.category] =
        (counts[item.category] || 0) + 1;
    });

    return Object.entries(counts).map(
      ([category, count]) => ({
        category,
        count,
      })
    );
  }, [data]);

  // --------------------------------------------------
  // REGION DISTRIBUTION
  // --------------------------------------------------

  const regionData = useMemo(() => {
    const counts: Record<string, number> = {};

    data.forEach((item) => {
      counts[item.region] =
        (counts[item.region] || 0) + 1;
    });

    return Object.entries(counts).map(
      ([region, count]) => ({
        region,
        count,
      })
    );
  }, [data]);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>
          <h1>Performance Analytics</h1>

          <p>
            High-performance data visualization dashboard
          </p>
        </div>

        <div className="dataset-control">

          <label htmlFor="dataset-size">
            Dataset Size
          </label>

          <select
            id="dataset-size"
            value={dataSize}
            onChange={(event) =>
              setDataSize(Number(event.target.value))
            }
          >
            <option value={10000}>
              10,000
            </option>

            <option value={100000}>
              100,000
            </option>

            <option value={250000}>
              250,000
            </option>

            <option value={500000}>
              500,000
            </option>
          </select>

        </div>

      </header>

      {/* ================= STATISTICS ================= */}

      <section className="stats-grid">

        {/* Records */}

        <div className="stat-card">

          <div className="stat-icon">
            <Database size={20} />
          </div>

          <div>
            <span>Records</span>

            <strong>
              {data.length.toLocaleString()}
            </strong>
          </div>

        </div>

        {/* Total Value */}

        <div className="stat-card">

          <div className="stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Total Value</span>

            <strong>
              {Math.round(totalValue).toLocaleString()}
            </strong>
          </div>

        </div>

        {/* Average */}

        <div className="stat-card">

          <div className="stat-icon">
            <BarChart3 size={20} />
          </div>

          <div>
            <span>Average</span>

            <strong>
              {averageValue.toFixed(2)}
            </strong>
          </div>

        </div>

        {/* System Status */}

        <div className="stat-card">

          <div className="stat-icon">
            <Zap size={20} />
          </div>

          <div>
            <span>System Status</span>

            <strong>
              {isLoading
                ? "Processing"
                : "Optimized"}
            </strong>
          </div>

        </div>

      </section>

      {/* ================= DATASET OVERVIEW ================= */}

      <section className="chart-card large-chart">

        <div className="chart-header">

          <h2>Value Over Time</h2>

          <p>
            Sampled performance values across the dataset
          </p>

        </div>

        {/* Loading message */}

        {isLoading && (
          <div className="loading-message">
            Generating{" "}
            {dataSize.toLocaleString()} records...
          </div>
        )}

        {!isLoading && data.length > 0 && (
          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="index"
                tick={{ fontSize: 10 }}
              />

              <YAxis
                tick={{ fontSize: 10 }}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

            </LineChart>
          </ResponsiveContainer>
        )}

        {!isLoading && data.length === 0 && (
          <div className="empty-state">
            No data available
          </div>
        )}

      </section>

      {/* ================= DISTRIBUTION CHARTS ================= */}

      <section className="charts-grid">

        {/* CATEGORY */}

        <div className="chart-card">

          <div className="chart-header">

            <h2>Category Distribution</h2>

            <p>
              Records grouped by category
            </p>

          </div>

          {!isLoading && (
            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={categoryData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  isAnimationActive={false}
                />

              </BarChart>

            </ResponsiveContainer>
          )}

        </div>

        {/* REGION */}

        <div className="chart-card">

          <div className="chart-header">

            <h2>Region Distribution</h2>

            <p>
              Records grouped by region
            </p>

          </div>

          {!isLoading && (
            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={regionData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="region"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  isAnimationActive={false}
                />

              </BarChart>

            </ResponsiveContainer>
          )}

        </div>

      </section>

      {/* ================= PERFORMANCE INFO ================= */}

      <section className="performance-info">

        <div>
          <strong>
            Performance Optimization
          </strong>

          <p>
            Large datasets are generated inside a
            Web Worker and charts render a sampled
            dataset to maintain UI responsiveness.
          </p>
        </div>

        <div className="performance-badge">
          {isLoading
            ? "Processing..."
            : "Optimized"}
        </div>

      </section>

    </div>
  );
}

export default App;