function toggleCheckboxesEnabled(){    
    const boxes = document.querySelectorAll('.note-input');
    for (n in boxes) boxes[n].disabled = !(boxes[n].disabled);
}

function toggleNotesTuning(){
    // Show or hide notes grid and label

    if (note_div.display == "none") {note_div.display="grid"; note_div_label.hidden = false}
    else {note_div.display = "none"; note_div_label.hidden = true}
}

function setup(){
    
    download_button = document.getElementById("download-button");
    download_button.addEventListener("click", outputZipFile,false);

    tune_freqs = document.getElementById('tune-freqs');
    note_div = document.getElementById('scale-notes').style;
    note_div_label = document.getElementById('notes-label')

    tune_freqs.addEventListener("change", toggleNotesTuning);

}