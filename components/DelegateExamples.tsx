"use client";

import { useState } from "react";

export default function DelegateExamples() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const examples = [
    {
      id: "smart-account",
      title: "Smart Account khác",
      description: "Ủy quyền cho Smart Account của app/game khác",
      address: "0x1234567890123456789012345678901234567890",
      useCase: "App subscription, Game payment, Service fee"
    },
    {
      id: "eoa",
      title: "EOA (Ví thông thường)",
      description: "Ủy quyền cho ví thông thường của bạn bè",
      address: "0x9876543210987654321098765432109876543210",
      useCase: "Family allowance, Friend payment, Personal use"
    },
    {
      id: "contract",
      title: "Contract Address",
      description: "Ủy quyền cho địa chỉ hợp đồng thông minh",
      address: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
      useCase: "DeFi protocol, DAO voting, Automated service"
    }
  ];

  return (
    <div style={{ padding: 16, backgroundColor: "#f8f9fa", borderRadius: 8, marginBottom: 20 }}>
      <h4>📋 Ví dụ Delegate Address</h4>
      <p>Click vào ví dụ để copy địa chỉ:</p>
      
      <div style={{ display: "grid", gap: 12 }}>
        {examples.map((example) => (
          <div
            key={example.id}
            style={{
              padding: 12,
              border: selectedExample === example.id ? "2px solid #007bff" : "1px solid #ddd",
              borderRadius: 8,
              backgroundColor: selectedExample === example.id ? "#e3f2fd" : "white",
              cursor: "pointer"
            }}
            onClick={() => {
              setSelectedExample(example.id);
              navigator.clipboard.writeText(example.address);
            }}
          >
            <h5 style={{ margin: "0 0 8px 0", color: "#007bff" }}>{example.title}</h5>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>{example.description}</p>
            <code style={{ 
              display: "block", 
              padding: "4px 8px", 
              backgroundColor: "#f1f1f1", 
              borderRadius: 4,
              fontSize: "12px",
              wordBreak: "break-all"
            }}>
              {example.address}
            </code>
            <small style={{ color: "#666", fontSize: "12px" }}>
              Use case: {example.useCase}
            </small>
          </div>
        ))}
      </div>
      
      {selectedExample && (
        <div style={{ 
          marginTop: 12, 
          padding: 8, 
          backgroundColor: "#d4edda", 
          border: "1px solid #c3e6cb", 
          borderRadius: 4,
          fontSize: "12px",
          color: "#155724"
        }}>
          ✅ Đã copy địa chỉ vào clipboard! Paste vào form bên dưới.
        </div>
      )}
    </div>
  );
}
