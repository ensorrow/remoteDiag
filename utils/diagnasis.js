module.exports = function(curr_data) {
    var random = Math.round(Math.random()*100);
    if(random<90) return 0;
    else return Math.ceil((random-90)/2.5);
}