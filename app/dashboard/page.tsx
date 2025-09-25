"use client";

import { useState, useEffect } from "react";
import EnvioFeed from "@/components/EnvioFeed";
import { queryTransfers } from "@/lib/envio";

export default function Dashboard() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'tips' | 'delegations'>('all');
  const [demoAddress] = useState("0x1bd5aCb8069DA1051911eB80A37723aA1ce5919C" as `0x${string}`);

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        const data = await queryTransfers(10);
        setTransfers(data);
      } catch (error) {
        console.error("Failed to load transfers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
    const interval = setInterval(loadTransfers, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Filter transfers based on active tab
  const filteredTransfers = transfers.filter(transfer => {
    switch (activeTab) {
      case 'tips':
        // Tips are transfers to creator addresses (demo logic)
        return transfer.to.toLowerCase() === demoAddress.toLowerCase();
      case 'delegations':
        // Delegations are transfers from smart accounts (demo logic)
        return transfer.from.toLowerCase() !== demoAddress.toLowerCase();
      default:
        return true; // Show all
    }
  });

  return (
    <div>
      <h2>📊 Social Coordination Dashboard</h2>
      <p>Realtime delegations, redemptions & transfers from Envio indexer.</p>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: 8, 
        marginBottom: 20,
        borderBottom: "1px solid #ddd",
        paddingBottom: 8
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: "8px 16px",
            border: "none",
            backgroundColor: activeTab === 'all' ? "#007bff" : "#f8f9fa",
            color: activeTab === 'all' ? "white" : "#333",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔄 All Activity
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          style={{
            padding: "8px 16px",
            border: "none",
            backgroundColor: activeTab === 'tips' ? "#28a745" : "#f8f9fa",
            color: activeTab === 'tips' ? "white" : "#333",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          💰 Tips Received
        </button>
        <button
          onClick={() => setActiveTab('delegations')}
          style={{
            padding: "8px 16px",
            border: "none",
            backgroundColor: activeTab === 'delegations' ? "#ffc107" : "#f8f9fa",
            color: activeTab === 'delegations' ? "white" : "#333",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🤝 Delegations
        </button>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <h3>
          {activeTab === 'all' && '🔄 Recent Activity'}
          {activeTab === 'tips' && '💰 Tips Received'}
          {activeTab === 'delegations' && '🤝 Delegation Activity'}
        </h3>
        {loading ? (
          <div>Loading transfers...</div>
        ) : filteredTransfers.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
            {activeTab === 'tips' && "No tips received yet. Share your content to get tips!"}
            {activeTab === 'delegations' && "No delegation activity yet. Create a delegation to see it here!"}
            {activeTab === 'all' && "No transfers found. Make a transfer to see it here!"}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredTransfers.map((transfer) => (
              <div key={transfer.id} style={{ 
                padding: 12, 
                border: "1px solid #ddd", 
                borderRadius: 8,
                backgroundColor: "#f8f9fa"
              }}>
                {/* Transaction Type Badge */}
                <div style={{ marginBottom: 8 }}>
                  {transfer.to.toLowerCase() === demoAddress.toLowerCase() ? (
                    <span style={{ 
                      backgroundColor: "#28a745", 
                      color: "white", 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      fontSize: "12px" 
                    }}>
                      💰 Tip Received
                    </span>
                  ) : (
                    <span style={{ 
                      backgroundColor: "#ffc107", 
                      color: "black", 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      fontSize: "12px" 
                    }}>
                      🤝 Delegation
                    </span>
                  )}
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <p><strong>From:</strong> {transfer.from}</p>
                    <p><strong>To:</strong> {transfer.to}</p>
                  </div>
                  <div>
                    <p><strong>Amount:</strong> {(Number(transfer.value) / 1000000).toFixed(6)} mUSDC</p>
                    <p><strong>Block:</strong> {transfer.blockNumber}</p>
                  </div>
                </div>
                <p><strong>Time:</strong> {new Date(Number(transfer.blockTimestamp) * 1000).toLocaleString()}</p>
                <p><strong>Tx:</strong> 
                  <a 
                    href={`https://testnet-explorer.monad.xyz/tx/${transfer.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    {transfer.transactionHash}
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>Delegations & Redemptions</h3>
        <EnvioFeed address={demoAddress} />
      </div>
    </div>
  );
}

