export const getCharacterFeedback = (isCorrect) => {
  const correctData = [
    { name: "Krishna", text: "सर्वथा सत्य है!", audio: "sarvatha_satya_trimmed", img: "correct_krishna.png" }
  ];

  const wrongData = [
    { name: "Ravana", text: "मूर्ख! तुम्हारा उत्तर गलत है।", audio: "ravana_1", img: "wrong_ravana.png" },
    { name: "Ravana", text: "हा हा हा! गलत उत्तर, दंड मिलेगा।", audio: "ravana_2", img: "wrong_ravana.png" },
    { name: "Kamsa", text: "यह उत्तर अनुचित है!", audio: "kamsa_1", img: "wrong_kamsa.png" },
    { name: "Kamsa", text: "सावधान! तुम्हारा विकल्प गलत है।", audio: "kamsa_2", img: "wrong_kamsa.png" }
  ];

  const data = isCorrect ? correctData : wrongData;
  const randomIndex = Math.floor(Math.random() * data.length);
  const selected = data[randomIndex];

  return {
    isCorrect,
    name: selected.name,
    text: selected.text,
    imgPath: `/characters/images/${selected.img}`,
    audioPath: `/characters/audio/${selected.audio}.mp3`
  };
};

export const playVoiceFeedback = (isCorrect) => {
  const feedback = getCharacterFeedback(isCorrect);
  const audio = new Audio(feedback.audioPath);
  
  if (isCorrect) {
    audio.volume = 0.85; // Louder and clearer for God voice
    audio.play().catch(error => {
      console.error("Audio play failed:", error);
    });
  } else {
    audio.volume = 0.6; // Demonic voice volume
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      try {
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(audio);
        
        const distortion = ctx.createWaveShaper();
        function makeDistortionCurve(amount) {
          let k = typeof amount === 'number' ? amount : 50,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
          for ( ; i < n_samples; ++i ) {
            x = i * 2 / n_samples - 1;
            curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
          }
          return curve;
        }
        distortion.curve = makeDistortionCurve(10);
        
        const biquadFilter = ctx.createBiquadFilter();
        biquadFilter.type = "lowshelf";
        biquadFilter.frequency.value = 200;
        biquadFilter.gain.value = 10;
        
        source.connect(distortion);
        distortion.connect(biquadFilter);
        biquadFilter.connect(ctx.destination);
        
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch (e) {
        console.error("Web Audio API failed:", e);
      }
    }
    
    audio.play().catch(error => {
      console.error("Audio play failed:", error);
    });
  }
  
  return feedback;
};
