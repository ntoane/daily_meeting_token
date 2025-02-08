import React, { useState, useCallback } from 'react';
import { 
  DailyProvider,
  useDaily,
  useMeetingState,
  useLocalParticipant,
  useParticipantProperty,
  DailyVideo
} from '@daily-co/daily-react';
import { 
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import PeopleIcon from '@mui/icons-material/People';
import { getRoomTokens } from '../services/api';

// Meeting component that handles the video call
const MeetingRoom = ({ token, roomUrl, onLeave }) => {
  const daily = useDaily();
  const meetingState = useMeetingState();
  console.log('Meeting State:', meetingState);
  const localParticipant = useLocalParticipant();
  const muted = useParticipantProperty(localParticipant?.session_id, 'muted');
  const videoOff = useParticipantProperty(localParticipant?.session_id, 'video');
  const [showParticipants, setShowParticipants] = useState(false);

  const handleJoin = useCallback(async () => {
    try {
      await daily.join({ 
        url: roomUrl,
        token: token 
      });
      console.log('Joined meeting:', roomUrl);
    } catch (error) {
      console.error('Error joining meeting:', error);
    }
  }, [daily, roomUrl, token]);

  const handleLeave = useCallback(async () => {
    try {
      await daily.leave();
      onLeave();
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  }, [daily, onLeave]);

  const toggleAudio = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(!muted);
    }
  }, [daily, muted]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(videoOff === null || videoOff === false);
    }
  }, [daily, videoOff]);

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };


  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Video Call
        </Typography>
        {meetingState === 'loading' && <CircularProgress />}
        {meetingState === 'joined-meeting' ? (
          <Box>
            <Box position="relative" width="100%" height="400px">
              {localParticipant && (
                <DailyVideo
                  sessionId={localParticipant.session_id}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  automirror
                />
              )}
            </Box>
            <Box mt={2}>
              <Button variant="contained" color={muted ? 'secondary' : 'primary'} onClick={toggleAudio} startIcon={muted ? <MicOffIcon /> : <MicIcon />}>
                {muted ? 'Unmute' : 'Mute'}
              </Button>
              <Button variant="contained" color={videoOff === null || videoOff === false ? 'secondary' : 'primary'} onClick={toggleVideo} startIcon={videoOff === null || videoOff === false ? <VideocamOffIcon /> : <VideocamIcon />} style={{ marginLeft: '8px' }}>
                {videoOff === null || videoOff === false ? 'Turn Off Video' : 'Turn On Video'}
              </Button>
              <Button variant="contained" color="default" onClick={toggleParticipants} startIcon={<PeopleIcon />} style={{ marginLeft: '8px' }}>
                Participants
              </Button>
              <Button variant="contained" color="error" onClick={handleLeave} style={{ marginLeft: '8px' }}>
                Leave
              </Button>
            </Box>
            {showParticipants && (
              <Box mt={2}>
                <Typography variant="h6">Participants:</Typography>
                {/* Implement participant list here */}
                <Typography variant="body2">Coming Soon...</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body1">
              Please join the meeting to start the video call.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleJoin}>
              Join Meeting
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main component that handles getting tokens and rendering the meeting
const DailyMeeting = () => {
  const [bookingId, setBookingId] = useState('');
  const [meetingData, setMeetingData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await getRoomTokens(bookingId);
      setMeetingData(data);
      console.log('Meeting Data:', data);
    } catch (error) {
      setError('Failed to get meeting details. Please check the booking ID.');
      console.error('Error fetching meeting tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveMeeting = () => {
    setMeetingData(null);
    setBookingId('');
  };

  return (
    <Card sx={{ maxWidth: 480, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Daily Video Meeting
        </Typography>
        
        {!meetingData ? (
          <Box component="form" onSubmit={handleGetMeeting} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Booking ID"
              variant="outlined"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              disabled={loading}
              error={!!error}
              helperText={error}
            />
            <Button 
              type="submit" 
              variant="contained"
              fullWidth
              disabled={loading || !bookingId}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Loading...' : 'Get Meeting'}
            </Button>
          </Box>
        ) : (
          <DailyProvider>
            <MeetingRoom
              token={meetingData.expert_token} // or meetingData.client_token
              roomUrl={meetingData.room_url}
              onLeave={handleLeaveMeeting}
            />
          </DailyProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyMeeting;