import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import API_BASE_URL from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(API_BASE_URL);
      setSocket(newSocket);

      // Emit user online status with full user data for personal room
      newSocket.emit('user-online', user);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinInterviewRoom = (roomId, userType) => {
    if (socket) {
      socket.emit('join-interview', {
        roomId,
        userId: user._id,
        userType
      });
    }
  };

  const sendQuestion = (roomId, question) => {
    if (socket) {
      socket.emit('interview-question', {
        roomId,
        question,
        askedBy: user._id
      });
    }
  };

  const sendAnswer = (roomId, answer) => {
    if (socket) {
      socket.emit('interview-answer', {
        roomId,
        answer,
        answeredBy: user._id
      });
    }
  };

  const sendFeedback = (roomId, feedback) => {
    if (socket) {
      socket.emit('feedback', {
        roomId,
        feedback,
        fromUser: user._id
      });
    }
  };

  const value = {
    socket,
    joinInterviewRoom,
    sendQuestion,
    sendAnswer,
    sendFeedback
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};