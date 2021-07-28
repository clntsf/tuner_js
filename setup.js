function changeFileText(promise_output){file_str = promise_output}

function freqForceCheckboxChange(checkbox_checked){
    // Show or hide notes grid and label
    if (checkbox_checked) tunetypes_container.style.display = "block";
    else tunetypes_container.style.display = "none";
}

// Shows or hides tunetype selectors based on radiobutton selection
tunetypeRadioChange = function(radio_value){

    if (radio_value === "1") {
        note_selector.style.display = "block";
        scale_selector.style.display = "none";
        tunetype="notes";
    }
    else {
        note_selector.style.display = "none";
        scale_selector.style.display="block";
        tunetype="scale";
    }
}

function setup(){

    default_scale = [0,2,4,5,7,9,11]
    download_button = document.getElementById("download-button");

    tunetypes_container = document.getElementById('tunetype-variants');
    note_selector = document.getElementById("notes-tunetype-container");
    scale_selector = document.getElementById("scales-tunetype-container");

    tunetype="notes"; file_str=''; filename=''
    tune_freqs = document.getElementById('tune-freqs');

}
