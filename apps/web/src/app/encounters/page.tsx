'use client';

import { useState, useEffect } from 'react';

interface Encounter {
  id: string;
  patientId: string;
  date: string;
  notes: string;
}

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/encounters')
      .then(res => res.json())
      .then(data => {
        setEncounters(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading encounters...</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Encounters</h1>
      <ul>
        {encounters.map(encounter => (
          <li key={encounter.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
            <strong>ID:</strong> {encounter.id} | <strong>Patient:</strong> {encounter.patientId} | 
            <strong>Date:</strong> {encounter.date} | Notes: {encounter.notes}
          </li>
        ))}
      </ul>
      <p>No encounters? API stub - implement full.</p>
    </main>
  );
}

