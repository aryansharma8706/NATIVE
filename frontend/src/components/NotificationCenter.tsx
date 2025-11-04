import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  IconButton, Badge, Menu, MenuItem, Typography, Box, List, ListItem,
  ListItemText, ListItemIcon, Divider, Button, Alert, CircularProgress,
  Chip, Avatar
} from '@mui/material';
import {
  Notifications as NotificationsIcon, Assignment as AssignmentIcon,
  Grade as GradeIcon, Schedule as ScheduleIcon, People as PeopleIcon,
  Circle as CircleIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/notifications?limit=10');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error: any) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment_created':
      case 'assignment_due_soon':
        return <AssignmentIcon />;
      case 'assignment_graded':
        return <GradeIcon />;
      case 'submission_received':
        return <CheckCircleIcon />;
      case 'classroom_joined':
        return <PeopleIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment_created':
        return 'primary';
      case 'assignment_graded':
        return 'success';
      case 'assignment_due_soon':
        return 'warning';
      case 'submission_received':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        {loading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && notifications.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}

        <List sx={{ maxHeight: 350, overflow: 'auto', p: 0 }}>
          {notifications.map((notification) => (
            <React.Fragment key={notification._id}>
              <ListItem
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': { backgroundColor: 'action.selected' },
                  cursor: 'pointer'
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: `${getNotificationColor(notification.type)}.main`,
                      width: 32,
                      height: 32
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" sx={{ flex: 1 }}>
                        {notification.title}
                      </Typography>
                      {!notification.isRead && (
                        <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                        {notification.sender && (
                          <Typography variant="caption" color="text.secondary">
                            from {notification.sender.firstName} {notification.sender.lastName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {notifications.length > 0 && (
          <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <Button size="small" onClick={handleClose}>
              View All Notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
}