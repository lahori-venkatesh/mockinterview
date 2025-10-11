import React from 'react';
import { useInvitation } from '../contexts/InvitationContext';
import InterviewInvitation from './InterviewInvitation';

const GlobalInvitationHandler = () => {
  const { 
    currentInvitation, 
    invitationOpen, 
    respondToInvitation, 
    closeInvitation 
  } = useInvitation();

  const handleAccept = (roomId) => {
    respondToInvitation(roomId, true);
  };

  const handleReject = (roomId) => {
    respondToInvitation(roomId, false);
  };

  return (
    <InterviewInvitation
      open={invitationOpen}
      onClose={closeInvitation}
      invitation={currentInvitation}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
};

export default GlobalInvitationHandler;