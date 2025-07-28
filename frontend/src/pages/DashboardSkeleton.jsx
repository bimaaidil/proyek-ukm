import React from 'react';
import { Table, Placeholder } from 'react-bootstrap';

function DashboardSkeleton() {
  // Buat beberapa baris kerangka untuk mengisi ruang
  const skeletonRows = Array.from({ length: 5 }, (_, index) => (
    <tr key={index}>
      <td><Placeholder xs={2} /></td>
      <td><Placeholder xs={8} /></td>
      <td><Placeholder xs={6} /></td>
      <td><Placeholder xs={4} /></td>
      <td>
        <Placeholder.Button variant="success" xs={4} className="me-2" />
        <Placeholder.Button variant="info" xs={4} />
      </td>
    </tr>
  ));

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Usaha</th>
          <th>Nama Pemilik</th>
          <th>Klasifikasi</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {skeletonRows}
      </tbody>
    </Table>
  );
}

export default DashboardSkeleton;