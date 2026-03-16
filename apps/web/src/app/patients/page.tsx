'use client';

import { useState, useEffect } from 'react';

interface Patient {
  id: string;
  name: string;
  dob: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading patients...</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Patients</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>DOB</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.dob}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>No patients? API stub - implement CRUD.</p>
    </main>
  );
}

