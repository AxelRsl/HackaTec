import React from 'react';

// Función para dibujar una mano detectada en el canvas
export const drawHand = (hand, ctx) => {
  // Verificar que tengamos un contexto y landmarks
  if (!ctx || !hand.landmarks) return;

  // Dibujar los landmarks (puntos) de la mano
  for (let i = 0; i < hand.landmarks.length; i++) {
    const landmark = hand.landmarks[i];
    const [x, y, z] = landmark;

    // Dibujar un círculo para cada punto
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 3 * Math.PI);
    
    // Diferentes colores para diferentes partes de la mano
    if (i === 0) {
      // Muñeca
      ctx.fillStyle = "blue";
    } else if (i >= 1 && i <= 4) {
      // Pulgar
      ctx.fillStyle = "purple";
    } else if (i >= 5 && i <= 8) {
      // Índice
      ctx.fillStyle = "red";
    } else if (i >= 9 && i <= 12) {
      // Medio
      ctx.fillStyle = "orange";
    } else if (i >= 13 && i <= 16) {
      // Anular
      ctx.fillStyle = "green";
    } else {
      // Meñique
      ctx.fillStyle = "pink";
    }
    
    ctx.fill();
  }
  
  // Conectar los puntos con líneas para mostrar la estructura de la mano
  // Conectar la muñeca con la base de cada dedo
  const palm = [0, 1, 5, 9, 13, 17, 0];
  for (let i = 0; i < palm.length - 1; i++) {
    const [x1, y1] = hand.landmarks[palm[i]];
    const [x2, y2] = hand.landmarks[palm[i + 1]];
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Conectar cada falange de los dedos
  const fingers = [
    [1, 2, 3, 4],      // Pulgar
    [5, 6, 7, 8],      // Índice
    [9, 10, 11, 12],   // Medio
    [13, 14, 15, 16],  // Anular
    [17, 18, 19, 20]   // Meñique
  ];
  
  for (let f = 0; f < fingers.length; f++) {
    const finger = fingers[f];
    for (let i = 0; i < finger.length - 1; i++) {
      const [x1, y1] = hand.landmarks[finger[i]];
      const [x2, y2] = hand.landmarks[finger[i + 1]];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      
      // Color según el dedo
      switch (f) {
        case 0: ctx.strokeStyle = "purple"; break;
        case 1: ctx.strokeStyle = "red"; break;
        case 2: ctx.strokeStyle = "orange"; break;
        case 3: ctx.strokeStyle = "green"; break;
        case 4: ctx.strokeStyle = "pink"; break;
        default: ctx.strokeStyle = "white";
      }
      
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
};
