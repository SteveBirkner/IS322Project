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
                //switch page and pass search string
                this.options.m.changePage(new bbProductResultsView({search: s}));
            }
        }
    }
});

var bbProductResultsView = Backbone.View.extend({
    template:_.template($('#bbresults').html()),
    initialize: function(){
        //listen for updates to productResults
        this.listenTo(productResults, 'add', this.addOne);
        search(this.options.search);//search using passed in search string
    },
    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },
    addOne: function(result) {
      var view = new ResultList({model: result});
      this.$("#result-list").append(view.render().el);
    }
});
var ResultList = Backbone.View.extend({
    tagName:  "p",
    template: _.template($('#item-template').html()),
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
});
//ProductResult Model
var ProductResult = Backbone.Model.extend({
   initialize: function() {
        console.log("New Product result model created");
    },
    defaults: function() {
      return {
        name: "undefined",
        regularPrice: 0.00,
        sku: 0,
        image: "undefined"
      };
    }
   
});

//ProductResults Collection
var ProductResults = Backbone.Collection.extend({
    initialize: function(){
        console.log("Created collection");
    },
   model: ProductResult 
});
//Create global collections
var productResults = new ProductResults;

//////Twitter//////////////////////////////////////////////////////////////////Twitter///////////////////////////////////
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
        this.changePage(new bbProductResultsView());
    },
    
    favs:function() {
        console.log('#favs');
        this.changePage(new favsView());
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
    console.log("Running query");
    var apikey = "d9cbk342np3k8jj9ntmybz5f";
    var url = "http://api.remix.bestbuy.com/v1/products(search=" + escape(str) + ")?apiKey=" + apikey + "&show=name,sku,regularPrice,image,longDescriptionHTML&sort=regularPrice.asc&format=json";
    $.ajax({
    type: "GET",
    url: url,
    cache: true,
    crossDomain:true,
    success: function(data) {
        //loop
        //var p1 = new Product({name: "name", image: "image", id:"id", price:"price"});
        for(var i = 0; i < data.products.length; i++){
            //var pr = new ProductResult(data.products[i]);
            productResults.add(data.products[i]);
        }
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



