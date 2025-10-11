import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const InvitationContext = createContext();

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitation must be used within an InvitationProvider');
  }
  return context;
};

export const InvitationProvider = ({ children }) => {
  const { socket } = useSocket() || {};
  const { user } = useAuth();
  const [currentInvitation, setCurrentInvitation] = useState(null);
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState(null);

  useEffect(() => {
    if (socket && user) {
      // Listen for incoming interview invitations
      socket.on('interview-invitation-received', (invitation) => {
        console.log('Interview invitation received:', invitation);
        setCurrentInvitation(invitation);
        setInvitationOpen(true);
        
        // Show notification
        toast.info(`Interview invitation from ${invitation.inviterName}!`, {
          autoClose: false,
          closeOnClick: false
        });
      });

      // Listen for invitation responses (for the inviter)
      socket.on('invitation-accepted', (data) => {
        console.log('Invitation accepted:', data);
        setWaitingForResponse(false);
        toast.success('Invitation accepted! Starting interview...');
        
        // Navigate to interview room
        setTimeout(() => {
          window.location.href = `/interview/${data.roomId}`;
        }, 1000);
      });

      socket.on('invitation-rejected', (data) => {
        console.log('Invitation rejected:', data);
        setWaitingForResponse(false);
        setPendingRoomId(null);
        toast.error('Interview invitation was declined. You can try with another user.');
      });

      socket.on('invitation-failed', (data) => {
        console.log('Invitation failed:', data);
        setWaitingForResponse(false);
        setPendingRoomId(null);
        toast.error(data.message);
      });

      return () => {
        socket.off('interview-invitation-received');
        socket.off('invitation-accepted');
        socket.off('invitation-rejected');
        socket.off('invitation-failed');
      };
    }
  }, [socket, user]);

  const sendInvitation = (inviteeId, inviterName, roomId, domain, questions) => {
    if (socket) {
      console.log('Sending interview invitation:', { inviteeId, inviterName, roomId, domain });
      
      setWaitingForResponse(true);
      setPendingRoomId(roomId);
      
      socket.emit('send-interview-invitation', {
        inviteeId,
        inviterName,
        roomId,
        domain,
        questions
      });
      
      toast.info('Interview invitation sent! Waiting for response...');
    }
  };

  const respondToInvitation = (roomId, accepted) => {
    if (socket) {
      console.log('Responding to invitation:', { roomId, accepted });
      
      socket.emit('respond-to-invitation', {
        roomId,
        accepted
      });
      
      setInvitationOpen(false);
      setCurrentInvitation(null);
    }
  };

  const closeInvitation = () => {
    setInvitationOpen(false);
    setCurrentInvitation(null);
  };

  const cancelWaiting = () => {
    setWaitingForResponse(false);
    setPendingRoomId(null);
  };

  const value = {
    currentInvitation,
    invitationOpen,
    waitingForResponse,
    pendingRoomId,
    sendInvitation,
    respondToInvitation,
    closeInvitation,
    cancelWaiting
  };

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
};

export default InvitationContext;