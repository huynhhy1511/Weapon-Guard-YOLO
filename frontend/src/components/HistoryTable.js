// src/components/HistoryTable.js
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../services/api'; // <--- Dùng cái này thay vì axios thường

const HistoryTable = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // api.get sẽ tự động đính kèm Token (nhờ file api.js bạn đã viết)
    api.get('/detections/history')
       .then(res => setHistory(res.data))
       .catch(err => console.error(err));
  }, []);

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Camera</TableCell>
            <TableCell>Weapon</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map(item => (
            <TableRow key={item.id}>
              <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
              <TableCell>{item.camera_id}</TableCell>
              <TableCell>
                 <Chip label={item.weapon_type} color="error" size="small" />
              </TableCell>
              <TableCell>
                  {/* Backend cần endpoint serve file tĩnh nếu muốn tải */}
                  <a href={`http://localhost:8000/${item.image_path}`} target="_blank" rel="noreferrer">
                      View Image
                  </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default HistoryTable;