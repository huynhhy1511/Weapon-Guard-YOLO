import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar = ({ open, onClose }) => {
  return (
    <Drawer open={open} onClose={onClose}>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/multi-view">
          <ListItemText primary="Multi View" />
        </ListItem>
        <ListItem button component={Link} to="/history">
          <ListItemText primary="History" />
        </ListItem>
        <ListItem button component={Link} to="/admin">
          <ListItemText primary="Manage Cameras" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;