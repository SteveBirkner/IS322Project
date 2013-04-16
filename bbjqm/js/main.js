var s = ""; //global search query -- delete once you get loading the collection working...
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
            s = $("#search").val();
            if(s.length > 0 && s != ""){   
                //switch page and pass search string
                this.options.m.changePage(new bbProductResultsView({search: s, m: this.options.m, page: "#results"}));
            }
        }
    }
});

var bbProductResultsView = Backbone.View.extend({
    template:_.template($('#bbresults').html()),
    initialize: function(){
        console.log("Initializing new bbProductResultsView");
        //listen for updates to productResults
        this.listenTo(productResults, 'add', this.addOne);
        this.listenTo(productResults, 'reset', this.addAll);
        //this.listenTo(productResults, 'all', this.addAll);
        if(this.options.search !== undefined){
            search(this.options.search);//search using passed in search string
            //works even on being called by "back" by being directed to /#results route
            //if search string is passed
        }
        else{
            //called when "back" button pressed or route /#results is activated
            //doesn't rerender the list.
            //supposed to use last collection and render
            //seems to work if addOne is called, addAll doesn't seem to trigger this unless it never
            //got called
            //this.addAll();
            //temporarily requery...
            search(s);
            
        }
        console.log(this.$("#result-list").html());
        
    },
    events:{
      "click table": "load"  
    },
    load: function(e){
        var item = productResults.findWhere({ cid: $(e.currentTarget).attr("id")});
        //changing pages loses element references (ie. $("#result-list") becomes undefined)
        //however calling search() again works???
        this.options.m.changePage(new SingleProductView({item: item, model: item, page: item.attributes.name}));
        this.unbind();
        this.remove();
        
    },
    render:function (eventName) {
        this.$el.html(this.template());
        return this.el;
    },
    addOne: function(result) {
        result.set({cid: result.cid});
      var view = new ResultList({model: result});
      console.log(view);
      console.log(this.$("#result-list"));
      this.$("#result-list").append(view.render().$el);
      view.remove();
    },
    addAll: function() {
        console.log("loading");
        productResults.each(this.addOne, this);
    },
    remove: function(){
        console.log("Removed");
    }
});
var ResultList = Backbone.View.extend({
    tagName:  "p",
    template: _.template($('#item-template').html()),
    initialize: function() {
    },
    render: function() {
        //console.log(this.model);
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    remove: function(){
        this.unbind();
        console.log("removed result list");
    }
});
//ProductResult Model
var ProductResult = Backbone.Model.extend({
   initialize: function() {
       // console.log("New Product result model created");
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
   model: ProductResult,
   localStorage: new Backbone.LocalStorage("productResults")
});
//Create global collections
var productResults = new ProductResults;
var SingleProductView = Backbone.View.extend({
    template: _.template($('#product-template').html()),
    initialize: function() {
    },
    events: {//remove this on route change
        "routes" : "remove"
    },
    render: function() {
        //console.log(this.model);
        $(this.el).html(this.template(this.model.toJSON()));
      //this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    remove: function(){
        this.unbind();
        this.remove();
    }
});
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
        this.changePage(new bbProductResultsView({ m: this, page: "#results"}));
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
            this.navigate(page.options.page);
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




