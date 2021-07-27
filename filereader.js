function readFile(){
    "Takes file obj from <input> tag, and reads it with a FileReader obj."
    const file = document.getElementById('file-input').files[0];
    const reader = new FileReader();
    if (file != undefined){
        reader.addEventListener('load', tuneCols.bind(null, file.name),false);
        reader.readAsText(file);
    }
}

function readTsv(file_str){
    "Reads tsv file from FileReader object given onload event, and returns 2D array"
    rows = file_str.split('\r'); df = [];
    for(i in rows) df.push(rows[i].split('\t'));
    return df
}

function constructScaleFreqs(scale){
    output = [];
    for(i=0;i<8;i++) for(j=0;j<scale.length;j++) if((12*i)+scale[j]<=88) output.push(Math.round(10000*toFreq(12*i+scale[j]-1))/10000);
    return output
}

function toFreq(note) {return 27.5 * Math.pow(2,(note)/12);}

function getScaleNotes(){
    checkboxes = document.querySelectorAll('input[type=checkbox]'); output=[]; 
    for(i in checkboxes) if (checkboxes[i].checked) output.push(parseInt(checkboxes[i].value))
    return output
}

function getClosest(pool, target){
    if (target === 0) {return 0}; temp=[]; min_dist = 5000;
    for (m=0;m<pool.length;m++) temp.push(Math.abs(pool[m]-target))
    n= temp.indexOf(Math.min(...temp)); return n
}

function getDateTimeStr(){
    options={year:'numeric',month:'numeric',day: 'numeric',hour:'numeric',minute:'numeric',second:'numeric',hour12:false}
    return Intl.DateTimeFormat(false, options).format(new Date()).replace(/:/gi,'.').replace(/\/|,\s/gi,'-')
}

function tuneCols(fn, event){

    let df = readTsv(event.target.result);
    const vlen = df.length; const formants = (df[0].length-1)*.5;

    const interval = parseInt(document.getElementById("interval-input").value);
    const tune_freqs = document.getElementById("tune-freqs").checked;
    const scale = Array.from(document.querySelectorAll('.note-input:checked')).map(x => parseInt(x.value));

    if(tune_freqs) scale_notes = constructScaleFreqs(scale)

    for (i=0;i<formants;i++){
        const freq_col=df.map(x=>x[2*i+1]);
        const amp_col=df.map(x=>x[2*i+2]);

        for (j=1;j<vlen;j=j+interval) {
            const slice_start = j; const slice_end = Math.min(j+interval, vlen);
            var nz_freq_count = 0; var nz_freqs = 0;

            for(k=slice_start;k<slice_end;k++) {
                if (amp_col[k]>0) {
                    nz_freq_count++; var temp = nz_freqs
                    nz_freqs += parseFloat(freq_col[k]);
                }
            }
            var range_freq = nz_freqs/Math.max(nz_freq_count,1);

            if (tune_freqs & (range_freq != 0)) range_freq = scale_notes[getClosest(scale_notes, range_freq)];
            for (l=slice_start;l<slice_end;l++) df[l][2*i+1]=range_freq;
        }
    }

    download_button.disabled = false;
    filename = fn.slice(0,-4);
    output_str = df.map(x => x.join('\t')).join('\r');

    var params = (
        "Tuning Params"+ "\n****************"
        + "\nFrequency Forcing: " + tune_freqs.toString()
        + "\nAveraging Interval: " + (interval*10).toString() + "ms"
    ); if (tune_freqs) params += "\nScale: [" + scale.filter(function(x){return x != NaN}).join(', ') + "]"
    console.log(params);
}

function outputZipFile(evt){
    var zip = new JSZip(); // Create .zip object
    zip.file(filename+"_tuned.swx", output_str); // Create params.txt file in folder
    zip.file("params.txt", params); // Create params.txt file in folder

    zip.generateAsync({type:"blob"}) // Generate the zip object
    .then(function(content) {
        saveAs(content, "tuning_done_"+getDateTimeStr()+".zip"); // Save (download) the zipped folder upon completion
    })
}