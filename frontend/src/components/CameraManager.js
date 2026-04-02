// src/components/CameraManager.js
import React, { useState, useEffect } from 'react';
import {
    Button, TextField, Dialog, DialogActions, DialogContent,
    DialogTitle, List, ListItem, ListItemText, ListItemSecondaryAction,
    IconButton, Typography, Container, Paper, Grid, Radio, RadioGroup,
    FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import VideocamIcon from '@mui/icons-material/Videocam';
import api from '../services/api';

const CameraManager = () => {
    const [cameras, setCameras] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    // State cho form
    const [name, setName] = useState('');
    const [sourceType, setSourceType] = useState('rtsp'); // 'rtsp' hoặc 'webcam'
    const [rtspUrl, setRtspUrl] = useState('');

    const fetchCameras = async () => {
        try {
            const response = await api.get('/cameras');
            setCameras(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách camera", error);
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    const handleOpen = (camera = null) => {
        if (camera) {
            setEditId(camera.id);
            setName(camera.name);
            // Phân loại:
            // 1. Chỉ có số -> webcam
            // 2. Bắt đầu bằng rtsp:// -> RTSP
            // 3. Còn lại -> Video File
            const urlStr = String(camera.rtsp_url);
            if (!isNaN(urlStr) && !urlStr.includes('.')) {
                setSourceType('webcam');
                setRtspUrl(urlStr);
            } else if (urlStr.toLowerCase().startsWith('rtsp://')) {
                setSourceType('rtsp');
                setRtspUrl(urlStr);
            } else {
                setSourceType('video');
                setRtspUrl(urlStr);
            }
        } else {
            setEditId(null);
            setName('');
            setSourceType('rtsp');
            setRtspUrl('');
        }
        setOpen(true);
    };

    const handleSave = async () => {
        // Nếu chọn Webcam, giá trị gửi đi là "0"
        let finalUrl = rtspUrl;
        if (sourceType === 'webcam') {
            finalUrl = '0';
        }

        if ((sourceType === 'rtsp' || sourceType === 'video') && (!finalUrl || finalUrl.trim() === '')) {
            alert("Vui lòng nhập đường dẫn hợp lệ!");
            return;
        }

        const cameraData = { name, rtsp_url: finalUrl };

        try {
            if (editId) {
                await api.put(`/cameras/${editId}`, cameraData);
            } else {
                await api.post('/cameras', cameraData);
            }
            setOpen(false);
            fetchCameras();
        } catch (error) {
            console.error("Lỗi lưu camera", error);
            alert("Có lỗi xảy ra, vui lòng kiểm tra lại!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa camera này?")) {
            try {
                await api.delete(`/cameras/${id}`);
                fetchCameras();
            } catch (error) {
                console.error("Lỗi xóa camera", error);
            }
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                        🎥 Quản Lý Camera
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleOpen()}
                    >
                        Thêm Mới
                    </Button>
                </Grid>

                <List>
                    {cameras.map((cam) => (
                        <ListItem key={cam.id} divider>
                            <VideocamIcon sx={{ mr: 2, color: 'gray' }} />
                            <ListItemText
                                primary={cam.name}
                                secondary={cam.rtsp_url === '0' ? "Nguồn: Webcam Laptop" : `RTSP: ${cam.rtsp_url}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" color="primary" onClick={() => handleOpen(cam)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" color="error" onClick={() => handleDelete(cam.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {cameras.length === 0 && (
                        <Typography align="center" color="textSecondary">Chưa có camera nào.</Typography>
                    )}
                </List>

                {/* Dialog Thêm/Sửa */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                    <DialogTitle>{editId ? 'Cập Nhật Camera' : 'Thêm Camera Mới'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Tên Camera (Ví dụ: Cam Laptop, Cổng Chính)"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <FormControl component="fieldset" sx={{ mb: 2 }}>
                            <FormLabel component="legend">Loại Nguồn Video</FormLabel>
                            <RadioGroup row value={sourceType} onChange={(e) => {
                                setSourceType(e.target.value);
                                if (e.target.value === 'webcam') setRtspUrl('0');
                                else setRtspUrl(''); // Xóa đường dẫn khi chuyển sang chế độ khác
                            }}>
                                <FormControlLabel value="rtsp" control={<Radio />} label="Camera IP (RTSP)" />
                                <FormControlLabel value="webcam" control={<Radio />} label="Webcam Laptop" />
                                <FormControlLabel value="video" control={<Radio />} label="Video File (Mô phỏng)" />
                            </RadioGroup>
                        </FormControl>

                        {(sourceType === 'rtsp' || sourceType === 'video') && (
                            <TextField
                                margin="dense"
                                label={sourceType === 'rtsp' ? "Đường dẫn RTSP (rtsp://...)" : "Đường dẫn Video (VD: D:/videos/test.mp4)"}
                                fullWidth
                                value={rtspUrl}
                                onChange={(e) => setRtspUrl(e.target.value)}
                            />
                        )}

                        {sourceType === 'webcam' && (
                            <Typography variant="body2" color="primary" sx={{ mt: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                ✅ Hệ thống sẽ sử dụng Webcam mặc định của máy tính (Index 0).
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="secondary">Hủy</Button>
                        <Button onClick={handleSave} color="primary" variant="contained">Lưu</Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
};

export default CameraManager;