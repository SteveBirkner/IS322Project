var s = ""; //global search query -- delete once you get loading the collection working...
window.HomeView = Backbone.View.extend({

    template:_.template($('#home').html()),

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },
    events: {
        //enter key triggers onEnter event
        "keypress":"onEnter",
        "click #fav" : "gotoFav"
        
    },
    onEnter: function(e){
        if(e.which == 13) {
            //if enter key and search isn't empty, do search
            s = $("#search").val();
            if(s.length > 0 && s != ""){   
                //switch page and pass search string
                app.navigate("#products/" + s, {trigger: true, replace: false});
            }
        }
    },
    
    gotoFav: function(e){
        //goes to favorties view
        console.log("in gotoFav");
        app.navigate("#favorites/",{trigger: true});
        
        
    }
});
window.ProductListView = Backbone.View.extend({
  tagName:'ul',
    template: _.template($('#bbresults').html()),
    initialize:function () {
        console.log("created product list view");
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (product) {
            product.set({id: product.get("sku")});
            $(self.el).append(new ProductListItemView({model:product}).render().el);
        });
    },
    events:{
      "click li": "load"  
    },
    load: function(e){
        //this is triggering twice, quick fix below but should be looked into
        console.log("Click event");
        console.log(e);
        if($(e.currentTarget).attr("id") !== undefined)
         app.navigate("#product/" +$(e.currentTarget).attr("id"), {trigger:true, replace:false});
    },
    render:function (eventName) {
        //_.each(this.model.models, function (product) {
        //    $(this.el).append(new ProductListItemView({model:product}).render().el);
        //}, this);
        this.$el.html(this.template());
        return this;
    }  
});




window.ProductListItemView = Backbone.View.extend({

    tagName:"li",

    template:_.template($('#item-template').html()),

    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});


//ProductResult Model
var ProductResult = Backbone.Model.extend({
    urlRoot: "/products",
    initialize: function() {
    },
    defaults:  {
        name: "undefined",
        regularPrice: 0.00,
        sku: 0,
        image: "undefined"
    }
   
});

//ProductResults Collection
var ProductResults = Backbone.Collection.extend({
    initialize: function(){
        console.log("Created collection");
    },
   model: ProductResult,
   url: "/products",
   localStorage: new Backbone.LocalStorage("productResults")
});
//Create global collections
//var productResults = new ProductResults;


window.SingleProductView = Backbone.View.extend({
    template: _.template($('#product-template').html()),
    initialize: function() {
    },
    events: {//remove this on route change
        "routes" : "close",
        "click #addto" : "addFav",
        "click #tweetTest" : "tweet"
    },
    render: function() {
        console.log(this.model);
        //console.log(this.model.get("name"));
        $(this.el).html(this.template(this.model.toJSON()));
      //this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    addFav: function(){
        
        var name = this.model.get("name");
        favsColl.add(this.model);
        //this.model.save();
        favsColl.save();
        console.log(favsColl);
        alert(name + " Added to Favorites");
        
    },
    tweet: function() {
        console.log("works");
        var q = this.model.get("name");
        app.navigate('tweets/' + q,{trigger: true, replace: false});
        
        return false;
        
    
        
    }
});

//////Twitter//////////////////////////////////////////////////////////////////Twitter///////////////////////////////////
window.Tweet = Backbone.Model.extend({
    initialize: function() {
        console.log("booms");
    },
    defaults: {
        author: "",
        text:""
    },
    
    urlRoot: "/tweets"

});

window.TweetColl = Backbone.Collection.extend({
    initialize: function () {
       console.log("boom");
    },
    model: Tweet,
    urlRoot: "/tweets",
    localStorage: new Backbone.LocalStorage("tweetColl")
    
});
window.TweetListView = Backbone.View.extend({
    tagName: 'ul',
    template:_.template($('#tweetlist-template').html()),
    initialize: function () {
       var self=this;
       
       this.model.bind( 'reset', this.render, this);
       this.model.bind( 'add', function(tweet) {
            tweet.set({author: tweet.get("from_user"), text: tweet.get("text")});
            
            $(self.el).append( new TweetListTweetView({model: tweet}).render());
        
       });
       
    },
    events: {//remove this on route change
        "routes" : "close",
    },
    render: function () {
       this.$el.html(this.template());
        
        return this.el;
    }
    

});


window.TweetListTweetView = Backbone.View.extend({
    tagName: 'li',
    
    initialize: function () {
        this.template = _.template($('#tweetListTemp').html());
        
        this.model.bind('change', this.render(), this);
        this.model.bind('destory', this.close(), this);
        
    },
    events: {//remove this on route change
        "routes" : "close"
    },
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        
        return this.el;
    
    }
    
});








// Favorites ////////////////////////////////////////

window.FavListView = Backbone.View.extend({
    tagName: 'ul',
    template:_.template($('#favResults').html()),
    initialize: function () {
       var self=this;
       this.model.bind( 'reset', this.render, this);
       this.model.bind( 'add', function(favorite) {
            favorite.set({id: favorite.get("sku")});
            //favorite.save();
            $(self.el).append( new FavoriteItemsListFavView({model: favorite}).render());
        
       });
       console.log(this.model);
       favsColl.fetch();
       
    },
      events:{
      "click li": "load",
      "routes": "close"
    },
    
    load: function(e) {
        console.log(e);
        var click = $(e.currentTarget).attr("id");
        if(click !== undefined && click != "undefined")
         app.navigate("#favorites/" +click, {trigger:true, replace:false});
    },
    addOne: function(m){
        console.log("Added one");
        console.log(m);
        $(this.el).append( new FavoriteItemsListFavView({model: m}).render());
    },
    addAll: function(){
        console.log("Add all");
        this.model.each(this.addOne, this);        
    },
    render: function (eventName) {
       this.$el.html(this.template());
        _.each(this.model.models, function (fav) {
            console.log("appended");
            console.log(fav);
            $(this.el).append(new FavoriteItemsListFavView({model:fav}).render().el);
        }, this);
        return this;
    }
    

});

window.FavoriteItemsListFavView = Backbone.View.extend({

    tagName:"li",

    template:_.template($('#fav-template').html()),

    initialize:function () {
        console.log("Fav item");
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
        
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});


window.SingleFavView = Backbone.View.extend({
    template: _.template($('#singleFav-template').html()),
    initialize: function() {
    },
    events: {
        "routes" : "close",
        "click #remove" : "removefav",
        "click #tweetTest" : "tweet"
    },
    render: function() {
        console.log(this.model);
      
        $(this.el).html(this.template(this.model.toJSON()));
     
      return this;
    },
    removefav: function(){
        
        console.log(this.model.get("name"));
        var name = this.model.get("name");
        alert(name + " Removed From Favorites");
        favsColl.remove(this.model);
        favsColl.save();
        app.navigate("#favorites/", {trigger:true, replace:false});
        
        
    },
    tweet: function() {
        console.log("works");
        var q = this.model.get("name");
        app.navigate('tweets/' + q,{trigger: true});
    
        return false;
        
    
        
    }
});





window.Favorites = Backbone.Collection.extend({
    initialize: function () {
       console.log("boom");
    },
    model: ProductResult,
    urlRoot: "/favorites",
    localStorage: new Backbone.LocalStorage("favorites")
    
});
/*define("favorites", ["localstorage"], function(){
    var Favorites = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("Favorites")
    });    
    return new Favorites();
});
require(["someCollection"], function(someCollection) {
  // ready to use someCollection
});*/
var favsColl = new Favorites();



var AppRouter = Backbone.Router.extend({

    routes:{
        "":"home",
        "products/:s":"products",
        "product/:id":"product",
        "favorites/" : "favs",
        "favorites/:id" : "fav",
        "tweets/:q" : "tweets"
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
        this.changePage(new HomeView());
    },
    favs: function () {
        
        this.favscoll = favsColl;
        var self = this;
        console.log("here");
        console.log(this.favscoll);
        self.favListView = new FavListView({model: self.favscoll});
        self.changePage(self.favListView);
        
    },
    fav: function (n) {
        console.log("Here");
        if(this.favscoll && n !== undefined && parseInt(n) > 0){
            console.log(n);
            console.log(this.favscoll);
            var m = this.favscoll.findWhere({id: parseInt(n)});
            console.log("Loading single fav page");
            this.changePage(new SingleFavView({model: m}));
        }
    },
    products:function(s) {
        console.log('#product list');
        
        this.productList = new ProductResults();
        search(s, this.productList);
        var self = this;
        this.productList.fetch({
            success: function(){
                console.log("succes product fetch");
                self.productListView = new ProductListView({model:self.productList});
                //$("body").html(self.productListView.render().el);
                self.changePage(self.productListView);
            },
            error: function(){
                console.log("failed");
            }
        });
        //this.changePage(new bbProductResultsView({ m: this, page: "#results"}));
    },
    product:function(n){
        //var item = productResults.findWhere({ sku: sku});
        if(this.productList && n !== undefined){
            console.log(n);
            console.log(this.productList);
            console.log(this.productList.findWhere({id: parseInt(n)}));
            var m = this.productList.findWhere({id: parseInt(n)});
            console.log("Loading single product page");
            this.changePage(new SingleProductView({model: m}));
        }
      //this.changePage(new SingleProductView({  
    },
    tweets: function(q) {
        console.log("tweet list");
        this.tweetList = new TweetColl();
        twitSearch(betterSearches(q),this.tweetList);
        var self = this;
        this.tweetList.fetch({
            success: function() {
                self.tweetListView = new TweetListView({model:self.tweetList});
                self.changePage(self.tweetListView);
            }
        
        });
        
        
        
        
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
            this.navigate("");
        }
        else{
            //this.navigate(page.options.page);
        }
        
        $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
    }

});

$(document).ready(function () {
    console.log('document ready');
    app = new AppRouter();
    Backbone.history.start();
    Backbone.View.prototype.close = function(){
        this.remove();
        this.unbind();
    }
});

function search(str, collections){
    console.log("Running query");
    var apikey = "d9cbk342np3k8jj9ntmybz5f";
    var url = "http://api.remix.bestbuy.com/v1/products(name=" + escape(str + "*") + "&(bias(name, -30)|bias(regularPrice,50)))?apiKey=" + apikey + "&show=name,sku,regularPrice,image,longDescriptionHTML,&format=json";
    $.ajax({
    type: "GET",
    url: url,
    cache: true,
    crossDomain:true,
    success: function(data) {
        console.log(data.products);
        //loop
        //var p1 = new Product({name: "name", image: "image", id:"id", price:"price"});
       for(var i = 0; i < data.products.length; i++){
            collections.add(data.products[i]);
        }
    },
    dataType: 'jsonp',
 
    });
}

function betterSearches(str){
    //attempt to provide twitter with an easier search query
    //twitter doesn't sort by number of matches in query string
    //it seems to just match at least one word
    //https://dev.twitter.com/docs/using-search
    //https://dev.twitter.com/docs/api/1/get/search
    //not sure if it'd be better to just use the original search text instead :/
    //remove odd url hashtags in product name
    str = str.replace(/&([^;]+);/g, '');
    console.log(str);
    
    //remove special
    str = str.replace(/[`~!@#$%^&*()_|+\-=?;:',<>."\{\}\[\]\\\/]/gi, '').toLowerCase().trim();
    str = str.replace(/\d+/g, '');
    console.log("Replaced: " + str);
    //filter common
    var common = ['just', 'with', 'or', 'the', 'it', 'is', 'a', 'an', 'by', 'to', 'you', 'me', 'he', 'she', 'they', 'we', 'how', 'i', 'are', 'to', 'for', 'of', 'gb','mb','tb'];
    for(var i = 0; i < common.length; i++){
        str = str.split(' ' + common[i] + ' ').join(' ');
    }
    console.log("No common: " + str);
    str = str.replace( /  +/g, ' ' );
    //read that split/join method was faster as of jan '13
    str = str.trim();
    
    str = str.split(' ').join(' OR ');
    console.log("Edit: " + str);
    return str;
}



function twitSearch(q, coll){
     // number of tweets to return
    $.ajax({
        //url : "https://api.twitter.com/1.1/search/tweets.json?q=" + escape(q) + "&lang=en&count=25&filter_level=high&result_type=mixed",
        //above url is v 1.1, requires authentication if you want to try to use that to see if it's any better.
        //consider streaming to match for "completeness"
        //https://dev.twitter.com/docs/api/1.1/post/statuses/filter
       url : "http://search.twitter.com/search.json?q=" + escape(q) + "&lang=en&rpp=25&filter_level=high",
       type: "GET",
       cache: true,
    crossDomain:true,
       dataType : "jsonp" ,
       timeout : 15000,
       
       success : function(data){
        
        for(var i=0;i < data.results.length; i++){
            coll.add(data.results[i]);
        }
        
       },
       
       error: function() {
        alert("Twitter Failed");
       },
       
       
    });
    
}

/*require.config({
    paths: {
        jquery: "lib/jquery",
        underscore: "lib/underscore",
        backbone: "lib/backbone",
        localstorage: "lib/backbone.localStorage"
    }
});*/




