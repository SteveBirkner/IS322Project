var apikey = "d9cbk342np3k8jj9ntmybz5f";
$(document).keypress(function(e) {
    if(e.which == 13) {
        var s = $("#search").val();
        if(s.length > 0){
            console.log("clicked");
            search(s);
            twitSearch(s,25);
            
        }
    }
});
function search(str){
    var url = "http://api.remix.bestbuy.com/v1/products(search=" + escape(str) + ")?apiKey=" + apikey + "&show=name,sku,regularPrice&sort=regularPrice.asc&format=json";
    $.ajax({
    type: "GET",
    url: url,
    cache: true,
    crossDomain:true,
    success: function(data) {
        console.log(data);
    },
    dataType: 'jsonp',
 
});
    /*localStorage.setItem("search", str);
    document.write(localStorage.getItem("search"));
    localStorage.removeItem("search");*/
}
var statusElem = document.getElementById('status')

setInterval(function () {
  statusElem.className = navigator.onLine ? 'online' : 'offline';
  statusElem.innerHTML = navigator.onLine ? 'online' : 'offline';  
}, 250);


/* Twitter API */

var q = "Macbook Air"; // Test var for search
var rpp = "25"; // number of tweets to return

function twitSearch(q,rpp){
    
    $.ajax({
       url : "http://search.twitter.com/search.json?q=" + escape(q) + "&callback=?&lang=en&rpp=" + rpp,
       dataType : "json" ,
       timeout : 15000,
       
       success : function(data){
        console.log(data);
       },
       
       error: function() {
        alert("Twitter Failed");
       },
       
       
    });
    
}

//twitSearch(q,rpp);

