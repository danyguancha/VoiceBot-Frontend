import React, { useState, useEffect } from "react";
import api from '../../api';


const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaRecorder(new MediaRecorder(stream));
      setError('');
    } catch (err) {
      setStatus('⚠️ Permiso de micrófono denegado');
      setError('Error: Se requieren permisos de micrófono para esta aplicación.');
    }
  };
  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  useEffect(() => {
    requestMicrophonePermission();
  }, []);

  const sendAudioToBackend = (audioBlob) => {

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    
    api.post("/api/chat/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(response => {
        addChatMessage(response.data.text, 'user');
        addChatMessage(response.data.response, 'bot');
        const audioUrl = response.data.audioUrl; 
        playAudio(audioUrl);
        
      })
      .catch(error => {
        setError(`Error al comunicarse con el servidor: ${error.message}`);
      });
  };


  

  const startRecording = () => {
    if (mediaRecorder) {
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        sendAudioToBackend(audioBlob);
      };
      mediaRecorder.start();
      setIsListening(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isListening) {
      mediaRecorder.stop();
      setIsListening(false);
    }
  };

  const handleStartButtonClick = () => {
    setShowWelcomeMessage(false);
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const addChatMessage = (text, sender) => {
    setChatMessages(prevMessages => [
      ...prevMessages,
      { text, sender }
    ]);
  };

  return (
    <div className="container">
      <h1 className="title">VoiceBot</h1>
      <div id="permissions-warning" className="permissions-warning">
        ⚠️ Se requieren permisos de micrófono para esta aplicación
      </div>
      <div id="chat" className="chat-container">
        {chatMessages.map((message, index) => (
          <div
          key={index}
          className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          dangerouslySetInnerHTML={{ __html: message.text }}  // Esto procesará el HTML
        />
        ))}
      </div>
      {showWelcomeMessage && (
        <div className="message_bienvenida">¿En qué puedo  ayudarte?</div>
      )}
      
      <button id="start" onClick={handleStartButtonClick} disabled={status.includes('Permiso denegado')}>
        <i className={`fa ${isListening ? 'fa-stop' : 'fa-microphone'}`} />
      </button>
      <p id="status">{status}</p>
      {error && <p id="error" className="error">{error}</p>}
    </div>
  );
};

export default VoiceToText;
