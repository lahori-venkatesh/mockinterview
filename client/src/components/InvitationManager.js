import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewInvitation from './InterviewInvitation';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const InvitationManager = () => {
  const [currentInvitation, setCurrentInvitation] = useState(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    const handleInvitation = (invitation) => {
      console.log('Received interview invitation:', invitation);
      setCurrentInvitation(invitation);

      toast.info(`Interview invitation from ${invitation.interviewer.name}!`, {
        autoClose: false,
        closeOnClick: false
      });
    };

    const handleInvitationAccepted = (data) => {
      console.log('🎉 Global: Invitation accepted event received:', data);
      toast.success(data.message || 'Interview invitation accepted!');
      
      // Navigate to interview room
      if (data.roomId) {
        console.log('🚀 Navigating to interview room:', data.roomId);
        navigate(`/interview/${data.roomId}`);
      } else {
        console.error('❌ No roomId provided in invitation-accepted event:', data);
      }
    };

    const handleInvitationRejected = (data) => {
      console.log('Global: Invitation rejected:', data);
      toast.info(data.message || 'Interview invitation was declined');
    };

    socket.on('interview-invitation', handleInvitation);
    socket.on('invitation-accepted', handleInvitationAccepted);
    socket.on('invitation-rejected', handleInvitationRejected);

    checkPendingInvitations();

    return () => {
      socket.off('interview-invitation', handleInvitation);
      socket.off('invitation-accepted', handleInvitationAccepted);
      socket.off('invitation-rejected', handleInvitationRejected);
    };
  }, [socket, user, navigate]);

  const checkPendingInvitations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/interviews/pending-invitations`);
      if (response.data.invitations.length > 0) {
        setCurrentInvitation(response.data.invitations[0]);
      }
    } catch (error) {
      console.error('Error checking pending invitations:', error);
    }
  };

  const handleInvitationClose = () => {
    setCurrentInvitation(null);
    toast.dismiss();
  };

  const handleInvitationRespond = (response, roomId) => {
    setCurrentInvitation(null);
    toast.dismiss();

    if (response === 'accepted' && roomId) {
      navigate(`/interview/${roomId}`);
    }
  };

  return (
    <>
      {currentInvitation && (
        <InterviewInvitation
          invitation={currentInvitation}
          onClose={handleInvitationClose}
          onRespond={handleInvitationRespond}
        />
      )}
    </>
  );
};

export default InvitationManager;




