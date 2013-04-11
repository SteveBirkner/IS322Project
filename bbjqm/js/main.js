window.HomeView = Backbone.View.extend({

    template:_.template($('#home').html()),

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },
    events: {
        //enter key triggers onEnter event
        "keypress":"onEnter"
    },
    onEnter: function(e){
        if(e.which == 13) {
            //if enter key and search isn't empty, do search
            var s = $("#search").val();
            if(s.length > 0 && s != ""){
                //should add a limit here to prevent "refresh" spamming
                //search(s);
                //trying to send result set to result page to display the output
                //this way doesn't work
                //this.changePage(new bbResultsView({results: search(s)}));
                //localStorage.set("search", s);
                console.log("Search: " + s);
                this.options.m.changePage(new bbResultsView({results: s}));
                
            }
        }
    }
});

window.bbResultsView = Backbone.View.extend({

    template:_.template($('#bbresults').html()),
    initialize: function(){
       // this.model.bind("change", this.render,this);
       console.log("Rec. Search: " + this.options.results);
       search(this.options.results);
    },
    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    }
});

//Result Model
var result = Backbone.Model.extend({
   initialize: function() {
        console.log("Result active");
   },
   
   // will need to pass the function the object and set aspects or object to them
   attributes: function() {
        this.set({name: "x"}); //will have to change later so we can add the object into it
        
   }
   
});

var res = new result();

//Results Collection
var resultsList = Backbone.Collection.extend({
   model: result 
});

var tweet = Backbone.Model.extend({
    initialize: function() {
    
        console.log("TweetTweet");
    },
    //this will get the twitter id and the tweet text
     attributes: function() {
        this.set({name: "x"}); //will have to change later so we can add the object into it
        
   }

});

var tweetsList = Backbone.Collection.extend({
    model: tweet    
    
});


//favorites view
window.favsView = Backbone.View.extend({
    
    template:_.template($('#favs').html()),
    
    render: function (eventName) {
        $(this.el).html(this.template());
        return this;
    }

});



window.Page1View = Backbone.View.extend({

    template:_.template($('#page1').html()),

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    }
});

window.Page2View = Backbone.View.extend({

    template:_.template($('#page2').html()),

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    }
});

var AppRouter = Backbone.Router.extend({

    routes:{
        "":"home",
        "page1":"page1",
        "page2":"page2",
        "results":"bbresults",
        "favs" : "favs"
    },

    initialize:function () {
        // Handle back button throughout the application
        $('.back').live('click', function(event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
    },

    home:function () {
        console.log('#home');
        this.changePage(new HomeView({m: this}));
    },
    bbresults:function() {
        console.log('#bbresults');
        this.changePage(new bbResultsView());
    },
    
    favs:function() {
        console.log('#favs');
        this.changePage(new favsView());
    },
    page1:function () {
        console.log('#page1');
        this.changePage(new Page1View());
    },

    page2:function () {
        console.log('#page2');
        this.changePage(new Page2View());
    },

    changePage:function (page) {
        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));
        var transition = $.mobile.defaultPageTransition;
        // We don't want to slide the first page
        if (this.firstPage) {
            transition = 'none';
            this.firstPage = false;
        }
        $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
    }

});

$(document).ready(function () {
    console.log('document ready');
    app = new AppRouter();
    Backbone.history.start();
});

function search(str){
    console.log(str);
    var apikey = "d9cbk342np3k8jj9ntmybz5f";
    var url = "http://api.remix.bestbuy.com/v1/products(search=" + escape(str) + ")?apiKey=" + apikey + "&show=name,sku,regularPrice,image,longDescriptionHTML&sort=regularPrice.asc&format=json";
    $.ajax({
    type: "GET",
    url: url,
    cache: true,
    crossDomain:true,
    success: function(data) {
        //console.log(data);
        //return (data);
    },
    dataType: 'jsonp',
 
    });
}

function twitSearch(q){
     // number of tweets to return
    $.ajax({
       url : "http://search.twitter.com/search.json?q=" + escape(q) + "&callback=?&lang=en&rpp=25",
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



