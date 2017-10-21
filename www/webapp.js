// Initialise some global variables
var config = {};
var images = [];
var currentImageIndex = -1;
var slideshowTimeout;


// Polls the server and checks for updates
function updateData() {
    console.log('Checking for new data...')
    $.ajax({
        url: "/data",
        success: function(result) {
            if (
                JSON.stringify(config) != JSON.stringify(result.config) ||
                JSON.stringify(images) != JSON.stringify(result.images)
            ) {
                console.log('New data!');

                config = result.config;
                images = result.images;

                (config.showTime) ? $('#time').show() : $('#time').hide();
                (config.showDate) ? $('#date').show() : $('#date').hide();

                clearTimeout(slideshowTimeout);
                tickSlideshow();
            }
        }
    });
}


// Called each time the image should change
function tickSlideshow() {
    if (currentImageIndex < images.length - 1) currentImageIndex++;
    else currentImageIndex = 0;
    $('#image').css('background-image', 'url("/images/' + images[currentImageIndex] + '")');
    slideshowTimeout = setTimeout(tickSlideshow, config.delay);
}


$(document).ready(function() {
    updateData();
    setInterval(updateData, 10000);
});