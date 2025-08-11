import { useState, useEffect, useRef } from 'react';
import { TimeSession } from '../types';

export const useTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedSessions = localStorage.getItem('productivitypulse_sessions');
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
      setSessions(parsedSessions);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const startTimer = (taskId?: string) => {
    setIsActive(true);
    setCurrentTaskId(taskId || null);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const stopTimer = () => {
    if (currentTaskId && seconds > 0) {
      const newSession: TimeSession = {
        id: Date.now().toString(),
        taskId: currentTaskId,
        startTime: new Date(Date.now() - seconds * 1000),
        endTime: new Date(),
        duration: Math.floor(seconds / 60),
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      localStorage.setItem('productivitypulse_sessions', JSON.stringify(updatedSessions));
    }

    setIsActive(false);
    setSeconds(0);
    setCurrentTaskId(null);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
    setCurrentTaskId(null);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isActive,
    seconds,
    currentTaskId,
    sessions,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};