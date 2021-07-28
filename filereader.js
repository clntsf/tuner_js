function constructScaleFreqs(scale){
    output = [];
    for(i=0;i<8;i++) for(j=0;j<scale.length;j++) if((12*i)+scale[j]<=88) output.push(Math.round(10000*toFreq(12*i+scale[j]-1))/10000);
    return output
}

function toFreq(note) {return 27.5 * Math.pow(2,(note)/12);}
function getClosest(pool, target){abs_dist = pool.map(x => Math.abs(x-target)); return scale_notes[abs_dist.indexOf(Math.min(...abs_dist))]}

function getDateTimeStr(){
    options={year:'numeric',month:'numeric',day: 'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12:false}
    return Intl.DateTimeFormat(false, options).format(new Date()).replace(/:/gi,'.').replace(/\/|,\s/gi,'-')
}

function tuneCols(){
    let df = file_str.split('\r').map(x => x.split('\t')); // Parses the .swx file (tsv format) into a 2d array
    const vlen = df.length; const formants = (df[0].length-1)*.5;

    const interval = parseInt(document.getElementById("interval-input").value);
    const tune_freqs = document.getElementById("tune-freqs").checked;

    if(tune_freqs) {
        if (tunetype == "notes") {
            scale = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(x => parseInt(x.value));
            if (scale.length == 0) alert('Input some notes to force to'); return
        }
        else {
            note = parseInt(document.querySelector("input[name='scale-input']:checked").value);
            scale = default_scale.map(function(x){if (x+note>12) return (x+note) % 12; else return x+note}).sort(function(a,b){return a-b});
        }
        scale_notes = constructScaleFreqs(scale)
    }

    for (i=0;i<formants;i++){
        const freq_col=df.map(x=>x[2*i+1]);
        const amp_col=df.map(x=>x[2*i+2]);

        for (j=1;j<vlen;j=j+interval) {
            const slice_start = j; const slice_end = Math.min(j+interval, vlen);
            var nz_freq_count = 0; var nz_freqs = 0;

            for(k=slice_start;k<slice_end;k++) {
                if (amp_col[k]>0) {
                    nz_freq_count++; nz_freqs += parseFloat(freq_col[k]);
                }
            }
            var range_freq = nz_freqs/Math.max(nz_freq_count,1)
            if (tune_freqs & (range_freq != 0)) range_freq = getClosest(scale_notes, range_freq);
            for (l=slice_start;l<slice_end;l++) df[l][2*i+1]=range_freq;
        }
    }

    download_button.disabled = false;
    output_str = df.map(x => x.join('\t')).join('\r');

    params = (
        "Tuning Params"+ "\n****************"
        + "\nFrequency Forcing: " + tune_freqs.toString()
        + "\nAveraging Interval: " + (interval*10).toString() + "ms"
    ); if (tune_freqs) {
        params += "\nScale: [" + scale.filter(function(x){return x != NaN}).join(', ') + "]"
    }
}

function outputZipFile(){
    var zip = new JSZip(); // Create .zip object
    zip.file(filename+"_tuned.swx", output_str); // Create params.txt file in folder
    zip.file("params.txt", params); // Create params.txt file in folder

    zip.generateAsync({type:"blob"}) // Generate the zip object
    .then(function(content) {
        saveAs(content, "tuning_done_"+getDateTimeStr()+".zip"); // Save (download) the zipped folder upon completion
    })
}
