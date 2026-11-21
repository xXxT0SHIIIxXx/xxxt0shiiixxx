const visualizer = (() => {
    const barCount = 24;
    const blockSize = 4;
    const barGap = 2;
    const isSupported = location.protocol !== "file:" && !!(window.AudioContext || window.webkitAudioContext);
    let audioContext = null;
    let analyser = null;
    let freqData = null;
    let canvas = null;
    let context = null;
    let frameId = 0;

    function connect(audio){
        if (!isSupported || analyser) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        freqData = new Uint8Array(analyser.frequencyBinCount);
        audioContext.createMediaElementSource(audio).connect(analyser);
        analyser.connect(audioContext.destination);
    }

    function fitCanvas(target){
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.round(target.clientWidth * ratio);
        const height = Math.round(target.clientHeight * ratio);
        if (target.width !== width || target.height !== height){
            target.width = width;
            target.height = height;
        }
        return ratio;
    }

    function getLevels(){
        analyser.getByteFrequencyData(freqData);
        const usedBins = freqData.length * 0.7;
        return Array.from({ length: barCount }, (_, index) => freqData[Math.floor(index * usedBins / barCount)] / 255);
    }

    function drawFrame(){
        const ratio = fitCanvas(canvas);
        const block = blockSize * ratio;
        const gap = barGap * ratio;
        const barWidth = (canvas.width - gap * (barCount - 1)) / barCount;
        context.clearRect(0, 0, canvas.width, canvas.height);
        getLevels().forEach((level, index) => {
            const blocks = Math.round(level * canvas.height / (block + gap));
            const left = index * (barWidth + gap);
            for (let step = 0; step < blocks; step++){
                context.fillStyle = step > blocks - 2 ? "#64b2f7" : "#0088ff";
                context.fillRect(left, canvas.height - (step + 1) * (block + gap), barWidth, block);
            }
        });
        frameId = requestAnimationFrame(drawFrame);
    }

    function start(target){
        stop();
        if (!analyser || !target) return;
        canvas = target;
        context = canvas.getContext("2d");
        if (audioContext.state === "suspended") audioContext.resume();
        frameId = requestAnimationFrame(drawFrame);
    }

    function stop(){
        cancelAnimationFrame(frameId);
        frameId = 0;
        if (context) context.clearRect(0, 0, canvas.width, canvas.height);
    }

    return { isSupported, connect, start, stop };
})();
