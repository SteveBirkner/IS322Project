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
        app.navigate("#favs/",{trigger: true, replace: false});
        
        
    }
});
window.ProductListView = Backbone.View.extend({
  tagName:'ul',
    template: _.template($('#bbresults').html()),
    initialize:function () {
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (product) {
            product.set({id: product.get("sku")});
            $(self.el).append(new ProductListItemView({model:product}).render().el);
        });
    },
    events:{
      "click table": "load"  
    },
    load: function(e){
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
    },

    close:function () {
        $(this.el).unbind();
        $(this.el).remove();
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
    close: function(){
        this.unbind();
        this.remove();
    },
    addFav: function(){
        
        console.log(this.model.get("name"));
        var name = this.model.get("name");
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
    
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        
        return this.el;
    
    },
    
    close: function () {
        $(this.el).unbind();
        $(this.el).remove();
    }
    
});











//favorites view
// p2 backbone vid 23 min mark
/*
window.favsView = Backbone.View.extend({
    
    template:_.template($('#favs').html()),
    
    render: function (eventName) {
        $(this.el).html(this.template());
        return this;
    }

});
*/
var AppRouter = Backbone.Router.extend({

    routes:{
        "":"home",
        "products/:s":"products",
        "product/:id":"product",
        "favs" : "favs",
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
    products:function(s) {
        console.log('#product list');
        
        this.productList = new ProductResults();
        search(s, this.productList);
        var self = this;
        this.productList.fetch({
            success: function(){
                self.productListView = new ProductListView({model:self.productList});
                //$("body").html(self.productListView.render().el);
                self.changePage(self.productListView);
            }
        });
        //this.changePage(new bbProductResultsView({ m: this, page: "#results"}));
    },
    product:function(n){
        //var item = productResults.findWhere({ sku: sku});
        if(this.productList){
            console.log(n);
            console.log(this.productList);
            console.log(this.productList.findWhere({id: parseInt(n)}));
            var m = this.productList.findWhere({id: parseInt(n)});
            this.changePage(new SingleProductView({model: m}));
        }
      //this.changePage(new SingleProductView({  
    },
    tweets: function(q) {
        console.log("tweet list");
        this.tweetList = new TweetColl();
        twitSearch(q,this.tweetList);
        var self = this;
        this.tweetList.fetch({
            success: function() {
                self.tweetListView = new TweetListView({model:self.tweetList});
                self.changePage(self.tweetListView);
            }
        
        });
        
        
        
        
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
});

function search(str, collections){
    console.log("Running query");
    var apikey = "d9cbk342np3k8jj9ntmybz5f";
    var url = "http://api.remix.bestbuy.com/v1/products(search=" + escape(str) + ")?apiKey=" + apikey + "&show=name,sku,regularPrice,image,longDescriptionHTML&sort=name.asc,&format=json";
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


function twitSearch(q, coll){
     // number of tweets to return
    $.ajax({
       url : "http://search.twitter.com/search.json?q=" + escape(q) + "&lang=en&rpp=25",
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


//notes

//remove from favs



