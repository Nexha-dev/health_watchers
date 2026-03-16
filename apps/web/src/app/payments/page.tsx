'use client';

import { useState, useEffect } from 'react';

interface Payment {
  id: string;
  patientId: string;
  amount: string;
  status: string;
  txHash?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading payments...</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Payments (Stellar)</h1>
      <ul>
        {payments.map(payment => (
          <li key={payment.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
            <strong>ID:</strong> {payment.id} | <strong>Patient:</strong> {payment.patientId} | 
            Amount: {payment.amount} XLM | Status: {payment.status} 
            {payment.txHash && <span> | Tx: <a href={`https://stellar.expert/explorer/testnet/tx/${payment.txHash}`} target="_blank">view</a></span>}
          </li>
        ))}
      </ul>
      <p>No payments? Connect Stellar service.</p>
    </main>
  );
}

